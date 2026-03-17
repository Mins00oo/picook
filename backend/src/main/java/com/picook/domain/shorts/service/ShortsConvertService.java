package com.picook.domain.shorts.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.picook.domain.shorts.dto.RecentShortsResponse;
import com.picook.domain.shorts.dto.ShortsConvertRequest;
import com.picook.domain.shorts.dto.ShortsConvertResponse;
import com.picook.domain.shorts.dto.ShortsRecipeResult;
import com.picook.domain.shorts.dto.YtDlpResult;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.entity.ShortsConversionHistory;
import com.picook.domain.shorts.entity.ShortsConversionLog;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.shorts.repository.ShortsConversionLogRepository;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

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
public class ShortsConvertService {

    private static final Logger log = LoggerFactory.getLogger(ShortsConvertService.class);

    private static final Pattern YOUTUBE_URL_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(youtube\\.com/(shorts/|watch\\?v=)|youtu\\.be/)[\\w-]{6,}.*$"
    );

    private final ShortsCacheService shortsCacheService;
    private final ShortsConversionHistoryRepository historyRepository;
    private final ShortsConversionLogRepository conversionLogRepository;
    private final YtDlpService ytDlpService;
    private final WhisperService whisperService;
    private final RecipeStructurizer recipeStructurizer;
    private final ObjectMapper objectMapper;
    private final ShortsRateLimiter rateLimiter;
    private final TransactionTemplate transactionTemplate;

    public ShortsConvertService(ShortsCacheService shortsCacheService,
                                ShortsConversionHistoryRepository historyRepository,
                                ShortsConversionLogRepository conversionLogRepository,
                                YtDlpService ytDlpService,
                                WhisperService whisperService,
                                RecipeStructurizer recipeStructurizer,
                                ObjectMapper objectMapper,
                                ShortsRateLimiter rateLimiter,
                                PlatformTransactionManager txManager) {
        this.shortsCacheService = shortsCacheService;
        this.historyRepository = historyRepository;
        this.conversionLogRepository = conversionLogRepository;
        this.ytDlpService = ytDlpService;
        this.whisperService = whisperService;
        this.recipeStructurizer = recipeStructurizer;
        this.objectMapper = objectMapper;
        this.rateLimiter = rateLimiter;
        this.transactionTemplate = new TransactionTemplate(txManager);
    }

    /**
     * 쇼츠 변환 — 외부 API 호출은 TX 밖에서, DB 저장만 TX 안에서 수행
     */
    public ShortsConvertResponse convert(UUID userId, ShortsConvertRequest request) {
        long startTime = System.currentTimeMillis();
        String normalizedUrl = normalizeUrl(request.youtubeUrl());
        validateYoutubeUrl(normalizedUrl);

        // Rate limiting
        rateLimiter.checkUserLimit(userId);

        String urlHash = sha256(normalizedUrl);
        String modelVersion = recipeStructurizer.getModelVersion();

        // Cache hit — DB 조회만 하므로 짧은 TX
        Optional<ShortsCache> cached = shortsCacheService.findByUrlHashAndModelVersion(urlHash, modelVersion);
        if (cached.isPresent()) {
            ShortsCache cache = cached.get();
            saveHistoryAndLog(userId, cache, normalizedUrl, startTime, true);
            ShortsRecipeResult recipe = parseResult(cache.getResult());
            return ShortsConvertResponse.of(cache, recipe, true);
        }

        // Video length check — 외부 프로세스, TX 밖
        ytDlpService.checkDuration(normalizedUrl);

        // Concurrent slot
        rateLimiter.acquireConcurrentSlot();
        Path audioPath = null;
        try {
            // 외부 API 호출 — TX 밖에서 수행 (DB 커넥션 점유 없음)
            long t0 = System.currentTimeMillis();
            YtDlpResult ytResult = ytDlpService.fetchMetadataAndExtractAudio(normalizedUrl);
            audioPath = ytResult.audioPath();
            long extractMs = System.currentTimeMillis() - t0;

            long t1 = System.currentTimeMillis();
            String transcript = whisperService.transcribe(audioPath);
            long transcribeMs = System.currentTimeMillis() - t1;

            long t2 = System.currentTimeMillis();
            ShortsRecipeResult recipe = recipeStructurizer.structurize(transcript);
            long structurizeMs = System.currentTimeMillis() - t2;

            String resultJson = objectMapper.writeValueAsString(recipe);

            // DB 저장만 트랜잭션으로 — 짧은 TX (~수십ms)
            ShortsCache cache = saveConversionResult(
                    userId, normalizedUrl, urlHash, modelVersion,
                    recipe.title(), resultJson, ytResult, startTime,
                    extractMs, transcribeMs, structurizeMs);

            return ShortsConvertResponse.of(cache, recipe, false);
        } catch (BusinessException e) {
            long totalMs = System.currentTimeMillis() - startTime;
            saveFailureLog(userId, normalizedUrl, e.getErrorCode(), e.getMessage(), totalMs);
            throw e;
        } catch (JacksonException e) {
            long totalMs = System.currentTimeMillis() - startTime;
            saveFailureLog(userId, normalizedUrl, "AI_STRUCTURIZE_FAILED", e.getMessage(), totalMs);
            log.error("Failed to serialize recipe result", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "레시피 결과 저장에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } finally {
            rateLimiter.releaseConcurrentSlot();
            deleteQuietly(audioPath);
        }
    }

    private ShortsCache saveConversionResult(UUID userId, String normalizedUrl,
                                              String urlHash, String modelVersion,
                                              String title, String resultJson,
                                              YtDlpResult ytResult,
                                              long startTime,
                                              long extractMs, long transcribeMs, long structurizeMs) {
        return transactionTemplate.execute(status -> {
            ShortsCache cache = shortsCacheService.save(
                    new ShortsCache(normalizedUrl, urlHash, modelVersion, title,
                            ytResult.thumbnailUrl(),
                            ytResult.channelName(), ytResult.originalTitle(), ytResult.durationSeconds(),
                            resultJson));
            historyRepository.save(new ShortsConversionHistory(userId, cache));
            long totalMs = System.currentTimeMillis() - startTime;
            conversionLogRepository.save(
                    ShortsConversionLog.success(userId, normalizedUrl, false,
                            totalMs, extractMs, transcribeMs, structurizeMs));
            log.info("Shorts conversion success: url={}, totalMs={}, extractMs={}, transcribeMs={}, structurizeMs={}",
                    normalizedUrl, totalMs, extractMs, transcribeMs, structurizeMs);
            return cache;
        });
    }

    private void saveHistoryAndLog(UUID userId, ShortsCache cache, String normalizedUrl,
                                    long startTime, boolean cacheHit) {
        transactionTemplate.executeWithoutResult(status -> {
            historyRepository.save(new ShortsConversionHistory(userId, cache));
            long totalMs = System.currentTimeMillis() - startTime;
            conversionLogRepository.save(
                    ShortsConversionLog.success(userId, normalizedUrl, cacheHit, totalMs, null, null, null));
            log.info("Shorts conversion cache hit: url={}, totalMs={}", normalizedUrl, totalMs);
        });
    }

    private void saveFailureLog(UUID userId, String normalizedUrl, String errorCode, String message, long totalMs) {
        transactionTemplate.executeWithoutResult(status -> {
            conversionLogRepository.save(ShortsConversionLog.failure(userId, normalizedUrl, errorCode, message, totalMs));
            log.warn("Shorts conversion failed: url={}, error={}, totalMs={}", normalizedUrl, errorCode, totalMs);
        });
    }

    @Transactional(readOnly = true)
    public List<RecentShortsResponse> getRecentConversions(UUID userId) {
        return historyRepository.findRecentByUserIdDistinctUrl(userId)
                .stream()
                .map(RecentShortsResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShortsConvertResponse getCacheDetail(UUID userId, Integer cacheId) {
        if (!historyRepository.existsByUserIdAndShortsCacheId(userId, cacheId)) {
            throw new BusinessException("SHORTS_NOT_FOUND", "변환 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND);
        }
        ShortsCache cache = shortsCacheService.findById(cacheId)
                .orElseThrow(() -> new BusinessException("SHORTS_NOT_FOUND", "변환 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        ShortsRecipeResult recipe = parseResult(cache.getResult());
        return ShortsConvertResponse.of(cache, recipe, true);
    }

    @Transactional
    public void deleteHistory(UUID userId, Integer historyId) {
        ShortsConversionHistory history = historyRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new BusinessException("SHORTS_NOT_FOUND", "변환 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        historyRepository.delete(history);
    }

    @Transactional
    public void deleteAllHistory(UUID userId) {
        historyRepository.deleteAllByUserId(userId);
    }

    @Transactional
    public ShortsCache reconvertFromCache(ShortsCache existing) {
        String url = existing.getYoutubeUrl();
        String modelVersion = recipeStructurizer.getModelVersion();

        // 외부 API 호출은 reconvert 호출자(AdminShortsService)가 TX 밖에서 호출하도록 구조 변경 필요
        // 현재는 기존 동작 유지 (관리자 기능이라 빈도가 낮음)
        Path audioPath = null;
        try {
            YtDlpResult ytResult = ytDlpService.fetchMetadataAndExtractAudio(url);
            audioPath = ytResult.audioPath();
            String transcript = whisperService.transcribe(audioPath);
            ShortsRecipeResult recipe = recipeStructurizer.structurize(transcript);

            String resultJson = objectMapper.writeValueAsString(recipe);
            existing.update(modelVersion, recipe.title(), resultJson);
            existing.updateMetadata(ytResult.channelName(), ytResult.originalTitle(),
                    ytResult.durationSeconds(), ytResult.thumbnailUrl());
            return shortsCacheService.save(existing);
        } catch (BusinessException e) {
            throw e;
        } catch (JacksonException e) {
            log.error("Failed to serialize recipe result during reconvert", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "레시피 결과 저장에 실패했습니다", HttpStatus.BAD_GATEWAY);
        } finally {
            deleteQuietly(audioPath);
        }
    }

    private String normalizeUrl(String url) {
        String trimmed = url.strip();
        if (trimmed.contains("?")) {
            String base = trimmed.substring(0, trimmed.indexOf('?'));
            if (trimmed.contains("v=")) {
                String videoId = trimmed.replaceAll(".*[?&]v=([^&]+).*", "$1");
                if (videoId.isBlank()) {
                    throw new BusinessException("INVALID_YOUTUBE_URL",
                            "유효하지 않은 유튜브 URL입니다", HttpStatus.BAD_REQUEST);
                }
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
        } catch (JacksonException e) {
            log.error("Failed to parse cached result", e);
            throw new BusinessException("AI_STRUCTURIZE_FAILED",
                    "캐시된 결과 파싱에 실패했습니다", HttpStatus.BAD_GATEWAY);
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
