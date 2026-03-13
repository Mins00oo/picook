package com.picook.domain.shorts.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.picook.domain.shorts.dto.RecentShortsResponse;
import com.picook.domain.shorts.dto.ShortsConvertRequest;
import com.picook.domain.shorts.dto.ShortsConvertResponse;
import com.picook.domain.shorts.dto.ShortsRecipeResult;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.entity.ShortsConversionHistory;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class ShortsConvertService {

    private static final Logger log = LoggerFactory.getLogger(ShortsConvertService.class);

    private static final Pattern YOUTUBE_URL_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(youtube\\.com/(shorts/|watch\\?v=)|youtu\\.be/)[\\w-]+.*$"
    );

    private final ShortsCacheService shortsCacheService;
    private final ShortsConversionHistoryRepository historyRepository;
    private final YtDlpService ytDlpService;
    private final WhisperService whisperService;
    private final RecipeStructurizer recipeStructurizer;
    private final ObjectMapper objectMapper;

    public ShortsConvertService(ShortsCacheService shortsCacheService,
                                ShortsConversionHistoryRepository historyRepository,
                                YtDlpService ytDlpService,
                                WhisperService whisperService,
                                RecipeStructurizer recipeStructurizer,
                                ObjectMapper objectMapper) {
        this.shortsCacheService = shortsCacheService;
        this.historyRepository = historyRepository;
        this.ytDlpService = ytDlpService;
        this.whisperService = whisperService;
        this.recipeStructurizer = recipeStructurizer;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ShortsConvertResponse convert(UUID userId, ShortsConvertRequest request) {
        String normalizedUrl = normalizeUrl(request.youtubeUrl());
        validateYoutubeUrl(normalizedUrl);

        String urlHash = sha256(normalizedUrl);
        String modelVersion = recipeStructurizer.getModelVersion();

        Optional<ShortsCache> cached = shortsCacheService.findByUrlHashAndModelVersion(urlHash, modelVersion);
        if (cached.isPresent()) {
            ShortsCache cache = cached.get();
            recordHistory(userId, cache);
            ShortsRecipeResult recipe = parseResult(cache.getResult());
            return ShortsConvertResponse.of(cache, recipe, true);
        }

        Path audioPath = null;
        try {
            audioPath = ytDlpService.extractAudio(normalizedUrl);
            String transcript = whisperService.transcribe(audioPath);
            ShortsRecipeResult recipe = recipeStructurizer.structurize(transcript);

            String resultJson = objectMapper.writeValueAsString(recipe);
            ShortsCache cache = shortsCacheService.save(
                    new ShortsCache(normalizedUrl, urlHash, modelVersion,
                            recipe.title(), null, resultJson)
            );

            recordHistory(userId, cache);
            return ShortsConvertResponse.of(cache, recipe, false);
        } catch (BusinessException e) {
            throw e;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize recipe result", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "레시피 결과 저장에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } finally {
            deleteQuietly(audioPath);
        }
    }

    public List<RecentShortsResponse> getRecentConversions(UUID userId) {
        return historyRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(RecentShortsResponse::of)
                .toList();
    }

    private void recordHistory(UUID userId, ShortsCache cache) {
        historyRepository.save(new ShortsConversionHistory(userId, cache));
    }

    private String normalizeUrl(String url) {
        String trimmed = url.strip();
        if (trimmed.contains("?")) {
            String base = trimmed.substring(0, trimmed.indexOf('?'));
            if (trimmed.contains("v=")) {
                String videoId = trimmed.replaceAll(".*[?&]v=([^&]+).*", "$1");
                return "https://www.youtube.com/watch?v=" + videoId;
            }
            return base;
        }
        return trimmed;
    }

    private void validateYoutubeUrl(String url) {
        if (!YOUTUBE_URL_PATTERN.matcher(url).matches()) {
            throw new BusinessException("INVALID_YOUTUBE_URL",
                    "유효하지 않은 유튜브 URL입니다", HttpStatus.BAD_REQUEST);
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private ShortsRecipeResult parseResult(String json) {
        try {
            return objectMapper.readValue(json, ShortsRecipeResult.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse cached result", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "캐시된 결과 파싱에 실패했습니다", HttpStatus.BAD_GATEWAY);
        }
    }

    @Transactional
    public ShortsCache reconvertFromCache(ShortsCache existing) {
        String url = existing.getYoutubeUrl();
        String urlHash = existing.getUrlHash();
        String modelVersion = recipeStructurizer.getModelVersion();

        // Delete old cache
        shortsCacheService.delete(existing);

        Path audioPath = null;
        try {
            audioPath = ytDlpService.extractAudio(url);
            String transcript = whisperService.transcribe(audioPath);
            ShortsRecipeResult recipe = recipeStructurizer.structurize(transcript);

            String resultJson = objectMapper.writeValueAsString(recipe);
            return shortsCacheService.save(
                    new ShortsCache(url, urlHash, modelVersion,
                            recipe.title(), null, resultJson)
            );
        } catch (BusinessException e) {
            throw e;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize recipe result during reconvert", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "레시피 결과 저장에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } finally {
            deleteQuietly(audioPath);
        }
    }

    private void deleteQuietly(Path path) {
        if (path != null) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                log.warn("Failed to delete temp file: {}", path, e);
            }
        }
    }
}
