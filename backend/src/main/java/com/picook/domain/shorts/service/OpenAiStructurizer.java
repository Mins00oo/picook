package com.picook.domain.shorts.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.picook.domain.shorts.dto.ShortsRecipeResult;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
                  "instruction": "조리 설명",
                  "type": "active 또는 wait",
                  "durationSeconds": 초단위시간(정수, 없으면 null)
                }
              ]
            }

            규칙:
            - type은 "active"(손이 필요한 작업) 또는 "wait"(대기 작업, 예: 끓이기, 재우기)
            - durationSeconds는 대기 시간이 명확할 때만 설정, 없으면 null
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
        this.webClient = WebClient.builder()
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

            if (content.contains("NOT_COOKING_VIDEO")) {
                throw new BusinessException("NOT_COOKING_VIDEO",
                        "요리 영상이 아닙니다", HttpStatus.BAD_REQUEST);
            }

            return objectMapper.readValue(content, ShortsRecipeResult.class);
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
