package com.picook.domain.shorts.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import io.netty.channel.ChannelOption;
import com.picook.domain.shorts.dto.ShortsRecipeResult;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiStructurizer implements RecipeStructurizer {

    private static final Logger log = LoggerFactory.getLogger(OpenAiStructurizer.class);

    private static final String SYSTEM_PROMPT = """
            당신은 요리 레시피 구조화 전문가입니다. 유튜브 쇼츠 영상의 음성 텍스트를 분석하여 구조화된 레시피 JSON으로 변환합니다.

            반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 반환하세요.

            {
              "title": "요리 이름",
              "description": "한 줄 설명",
              "servings": 인분수(정수),
              "estimatedTimeMinutes": 예상조리시간(분, 정수),
              "ingredients": ["재료1 양", "재료2 양", ...],
              "steps": [
                {
                  "stepNumber": 1,
                  "instruction": "조리 지시사항 (한국어, 명확하고 구체적으로)",
                  "type": "active 또는 wait",
                  "durationSeconds": 예상소요시간(초, 정수, 반드시 포함)
                }
              ]
            }

            각 조리 단계의 type과 durationSeconds 규칙:
            - type "active": 사용자가 직접 손으로 하는 행동 (썰기, 볶기, 섞기, 담기, 버무리기 등)
            - type "wait": 기다리는 시간이 있는 단계 (끓이기, 재우기, 오븐 굽기, 식히기 등)
            - 판단 기준: 사용자가 계속 손을 쓰고 있어야 하면 active, 놔두고 기다려도 되면 wait
            - durationSeconds는 모든 단계에 반드시 정수값을 포함해야 한다 (null 불가)
            - active 예시: "야채를 썬다" → 120, "양념장을 섞는다" → 60, "고기를 볶는다" → 180
            - wait 예시: "10분간 끓인다" → 600, "30분간 재운다" → 1800, "5분간 식힌다" → 300
            - 텍스트에 시간이 명시되어 있으면 그대로 초 단위로 변환
            - 시간이 명시되지 않은 active 단계는 60~180 사이로 추정

            기타 규칙:
            - 요리가 아닌 영상이면 정확히 {"error": "NOT_COOKING_VIDEO"} 만 반환
            - servings를 추정할 수 없으면 2로 설정
            """;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.chat-model}")
    private String chatModel;

    @Value("${openai.ai-model-version}")
    private String aiModelVersion;

    public OpenAiStructurizer(@Value("${openai.api-key}") String apiKey, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5_000)
                .responseTimeout(Duration.ofSeconds(30));
        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public ShortsRecipeResult structurize(String transcript) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", chatModel,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", transcript)
                    ),
                    "temperature", 0.3
            );

            String responseJson = webClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String content = extractContent(responseJson);
            log.debug("GPT raw content: {}", content);

            if (content.contains("NOT_COOKING_VIDEO")) {
                throw new BusinessException("NOT_COOKING_VIDEO",
                        "요리 영상이 아닙니다", HttpStatus.BAD_REQUEST);
            }

            // GPT가 ```json ... ``` 마크다운으로 감싸는 경우 처리
            String json = content.strip();
            if (json.startsWith("```")) {
                json = json.replaceFirst("```(?:json)?\\s*", "");
                json = json.replaceFirst("\\s*```$", "");
            }

            return objectMapper.readValue(json, ShortsRecipeResult.class).withStepDefaults();
        } catch (BusinessException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("OpenAI API error: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "AI 레시피 구조화에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } catch (JacksonException e) {
            log.error("Failed to parse AI response", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "AI 응답 파싱에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            log.error("AI structurize failed", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "AI 레시피 구조화에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }

    @Override
    public String getModelVersion() {
        return aiModelVersion;
    }

    private String extractContent(String responseJson) {
        try {
            var root = objectMapper.readTree(responseJson);
            return root.at("/choices/0/message/content").asText();
        } catch (Exception e) {
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "AI 응답 파싱에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }
}
