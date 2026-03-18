package com.picook.domain.shorts.service;

import com.picook.global.exception.BusinessException;
import io.netty.channel.ChannelOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.nio.file.Path;
import java.time.Duration;

@Service
public class WhisperService {

    private static final Logger log = LoggerFactory.getLogger(WhisperService.class);

    private final WebClient webClient;

    @Value("${openai.whisper-model}")
    private String whisperModel;

    public WhisperService(@Value("${openai.api-key}") String apiKey) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5_000)
                .responseTimeout(Duration.ofSeconds(60));
        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public String transcribe(Path audioPath) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(audioPath.toFile()));
            builder.part("model", whisperModel);
            builder.part("language", "ko");

            TranscriptionResponse response = webClient.post()
                    .uri("/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(TranscriptionResponse.class)
                    .block();

            String transcript = response != null ? response.text() : null;

            if (transcript == null || transcript.isBlank()) {
                log.warn("Whisper returned empty transcript for {}", audioPath.getFileName());
                throw new BusinessException("NO_AUDIO_CONTENT",
                        "음성이 없는 영상입니다. 음성 나레이션이 있는 영상만 변환할 수 있습니다.", HttpStatus.BAD_REQUEST);
            }

            log.debug("Whisper transcript ({}chars): {}", transcript.length(), transcript);

            // 음성이 너무 짧으면 레시피 구조화가 어려움 (배경음악 잡음 등)
            if (transcript.length() < 20) {
                log.warn("Whisper transcript too short ({}chars): {}", transcript.length(), transcript);
                throw new BusinessException("INSUFFICIENT_AUDIO",
                        "음성이 부족하여 레시피를 추출할 수 없습니다. 음성 설명이 충분한 영상을 사용해주세요.", HttpStatus.BAD_REQUEST);
            }

            return transcript;
        } catch (BusinessException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Whisper API error: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("WHISPER_API_FAILED",
                    "음성 인식에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            log.error("Whisper API call failed", e);
            throw new BusinessException("WHISPER_API_FAILED",
                    "음성 인식에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }

    private record TranscriptionResponse(String text) {}
}
