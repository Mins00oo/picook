package com.picook.domain.shorts.service;

import tools.jackson.databind.ObjectMapper;
import com.picook.domain.shorts.dto.ShortsConvertRequest;
import com.picook.domain.shorts.dto.ShortsConvertResponse;
import com.picook.domain.shorts.dto.ShortsRecipeResult;
import com.picook.domain.shorts.dto.RecentShortsResponse;
import com.picook.domain.shorts.dto.YtDlpResult;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.entity.ShortsConversionHistory;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.shorts.repository.ShortsConversionLogRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.lang.reflect.Field;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class ShortsConvertServiceTest {

    @Mock private ShortsCacheService shortsCacheService;
    @Mock private ShortsConversionHistoryRepository historyRepository;
    @Mock private ShortsConversionLogRepository conversionLogRepository;
    @Mock private YtDlpService ytDlpService;
    @Mock private WhisperService whisperService;
    @Mock private RecipeStructurizer recipeStructurizer;
    @Mock private ShortsRateLimiter rateLimiter;
    @Mock private PlatformTransactionManager txManager;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ShortsConvertService shortsConvertService;
    private UUID userId;

    @BeforeEach
    void setUp() {
        when(txManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        shortsConvertService = new ShortsConvertService(
                shortsCacheService, historyRepository, conversionLogRepository,
                ytDlpService, whisperService, recipeStructurizer, objectMapper, rateLimiter,
                txManager
        );
        userId = UUID.randomUUID();
        when(conversionLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void 캐시_히트_시_즉시_반환() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        ShortsRecipeResult recipe = createRecipeResult();
        String resultJson = objectMapper.writeValueAsString(recipe);
        ShortsCache cache = new ShortsCache(url, "hash", "gpt-4o-2025", "김치찌개", null, resultJson);
        setField(cache, "id", 1);
        setField(cache, "createdAt", Instant.now());

        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), eq("gpt-4o-2025")))
                .thenReturn(Optional.of(cache));
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShortsConvertResponse response = shortsConvertService.convert(userId, new ShortsConvertRequest(url));

        assertThat(response.fromCache()).isTrue();
        assertThat(response.recipe().title()).isEqualTo("김치찌개");
        verify(ytDlpService, never()).fetchMetadataAndExtractAudio(anyString());
        verify(whisperService, never()).transcribe(any());
    }

    @Test
    void 캐시_미스_시_전체_파이프라인_실행() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        ShortsRecipeResult recipe = createRecipeResult();
        String resultJson = objectMapper.writeValueAsString(recipe);
        ShortsCache savedCache = new ShortsCache(url, "hash", "gpt-4o-2025", "김치찌개", null, resultJson);
        setField(savedCache, "id", 1);
        setField(savedCache, "createdAt", Instant.now());

        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenReturn(new YtDlpResult(Path.of("/tmp/test.mp3"), "요리채널", "김치찌개 만들기", 60, "https://img.youtube.com/thumb.jpg"));
        when(whisperService.transcribe(any())).thenReturn("김치찌개 만드는 법...");
        when(recipeStructurizer.structurize(anyString())).thenReturn(recipe);
        when(shortsCacheService.save(any())).thenReturn(savedCache);
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShortsConvertResponse response = shortsConvertService.convert(userId, new ShortsConvertRequest(url));

        assertThat(response.fromCache()).isFalse();
        assertThat(response.recipe().title()).isEqualTo("김치찌개");

        var inOrder = inOrder(ytDlpService, whisperService, recipeStructurizer, shortsCacheService);
        inOrder.verify(ytDlpService).fetchMetadataAndExtractAudio(anyString());
        inOrder.verify(whisperService).transcribe(any());
        inOrder.verify(recipeStructurizer).structurize(anyString());
        inOrder.verify(shortsCacheService).save(any());
    }

    @Test
    void 모델_버전_불일치_시_캐시_미스() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        ShortsRecipeResult recipe = createRecipeResult();
        ShortsCache savedCache = new ShortsCache(url, "hash", "gpt-4o-2026", "김치찌개", null,
                objectMapper.writeValueAsString(recipe));
        setField(savedCache, "id", 1);
        setField(savedCache, "createdAt", Instant.now());

        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2026");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), eq("gpt-4o-2026")))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenReturn(new YtDlpResult(Path.of("/tmp/test.mp3"), null, null, null, null));
        when(whisperService.transcribe(any())).thenReturn("transcript");
        when(recipeStructurizer.structurize(anyString())).thenReturn(recipe);
        when(shortsCacheService.save(any())).thenReturn(savedCache);
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShortsConvertResponse response = shortsConvertService.convert(userId, new ShortsConvertRequest(url));

        assertThat(response.fromCache()).isFalse();
        verify(ytDlpService).fetchMetadataAndExtractAudio(anyString());
    }

    @Test
    void 유효하지_않은_URL_에러() {
        ShortsConvertRequest request = new ShortsConvertRequest("https://example.com/not-youtube");

        assertThatThrownBy(() -> shortsConvertService.convert(userId, request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("INVALID_YOUTUBE_URL");
                });
    }

    @Test
    void 음성_추출_실패_에러() {
        String url = "https://www.youtube.com/shorts/abc123";
        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenThrow(new BusinessException("AUDIO_EXTRACTION_FAILED", "음성 추출에 실패했습니다",
                        org.springframework.http.HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("AUDIO_EXTRACTION_FAILED");
                });
    }

    @Test
    void 요리_영상_아닌_경우_에러() {
        String url = "https://www.youtube.com/shorts/abc123";
        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenReturn(new YtDlpResult(Path.of("/tmp/test.mp3"), null, null, null, null));
        when(whisperService.transcribe(any())).thenReturn("게임 공략 영상입니다...");
        when(recipeStructurizer.structurize(anyString()))
                .thenThrow(new BusinessException("NOT_COOKING_VIDEO", "요리 영상이 아닙니다",
                        org.springframework.http.HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("NOT_COOKING_VIDEO");
                });
    }

    @Test
    void 영상_길이_초과_에러() {
        String url = "https://www.youtube.com/shorts/abc123";
        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        doThrow(new BusinessException("VIDEO_TOO_LONG", "3분 이하의 영상만 변환할 수 있습니다",
                org.springframework.http.HttpStatus.BAD_REQUEST))
                .when(ytDlpService).checkDuration(anyString());

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("VIDEO_TOO_LONG");
                });
        verify(ytDlpService, never()).fetchMetadataAndExtractAudio(anyString());
    }

    @Test
    void 분당_Rate_Limit_초과_에러() {
        String url = "https://www.youtube.com/shorts/abc123";
        doThrow(new BusinessException("RATE_LIMIT_EXCEEDED", "요청이 너무 많습니다.",
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS))
                .when(rateLimiter).checkUserLimit(any());

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("RATE_LIMIT_EXCEEDED");
                });
        verify(ytDlpService, never()).fetchMetadataAndExtractAudio(anyString());
    }

    @Test
    void 동시_변환_초과_에러() {
        String url = "https://www.youtube.com/shorts/abc123";
        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        doThrow(new BusinessException("SERVER_BUSY", "서버가 바쁩니다.",
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE))
                .when(rateLimiter).acquireConcurrentSlot();

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo("SERVER_BUSY");
                });
    }

    @Test
    void 성공_시_변환_로그에_단계별_시간_기록() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        ShortsRecipeResult recipe = createRecipeResult();
        String resultJson = objectMapper.writeValueAsString(recipe);
        ShortsCache savedCache = new ShortsCache(url, "hash", "gpt-4o-2025", "김치찌개", null, resultJson);
        setField(savedCache, "id", 1);
        setField(savedCache, "createdAt", Instant.now());

        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenReturn(new YtDlpResult(Path.of("/tmp/test.mp3"), "요리채널", "김치찌개 만들기", 60, null));
        when(whisperService.transcribe(any())).thenReturn("김치찌개 만드는 법...");
        when(recipeStructurizer.structurize(anyString())).thenReturn(recipe);
        when(shortsCacheService.save(any())).thenReturn(savedCache);
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        shortsConvertService.convert(userId, new ShortsConvertRequest(url));

        var logCaptor = org.mockito.ArgumentCaptor.forClass(
                com.picook.domain.shorts.entity.ShortsConversionLog.class);
        verify(conversionLogRepository).save(logCaptor.capture());
        var savedLog = logCaptor.getValue();
        assertThat(savedLog.getStatus()).isEqualTo("SUCCESS");
        assertThat(savedLog.isCacheHit()).isFalse();
        assertThat(savedLog.getTotalMs()).isNotNull().isGreaterThanOrEqualTo(0L);
        assertThat(savedLog.getExtractMs()).isNotNull().isGreaterThanOrEqualTo(0L);
        assertThat(savedLog.getTranscribeMs()).isNotNull().isGreaterThanOrEqualTo(0L);
        assertThat(savedLog.getStructurizeMs()).isNotNull().isGreaterThanOrEqualTo(0L);
    }

    @Test
    void 캐시_히트_시_변환_로그에_cacheHit_true() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        ShortsRecipeResult recipe = createRecipeResult();
        String resultJson = objectMapper.writeValueAsString(recipe);
        ShortsCache cache = new ShortsCache(url, "hash", "gpt-4o-2025", "김치찌개", null, resultJson);
        setField(cache, "id", 1);
        setField(cache, "createdAt", Instant.now());

        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), eq("gpt-4o-2025")))
                .thenReturn(Optional.of(cache));
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        shortsConvertService.convert(userId, new ShortsConvertRequest(url));

        var logCaptor = org.mockito.ArgumentCaptor.forClass(
                com.picook.domain.shorts.entity.ShortsConversionLog.class);
        verify(conversionLogRepository).save(logCaptor.capture());
        var savedLog = logCaptor.getValue();
        assertThat(savedLog.getStatus()).isEqualTo("SUCCESS");
        assertThat(savedLog.isCacheHit()).isTrue();
        assertThat(savedLog.getExtractMs()).isNull();
        assertThat(savedLog.getTranscribeMs()).isNull();
        assertThat(savedLog.getStructurizeMs()).isNull();
    }

    @Test
    void 실패_시_변환_로그에_에러코드_저장() throws Exception {
        String url = "https://www.youtube.com/shorts/abc123";
        when(recipeStructurizer.getModelVersion()).thenReturn("gpt-4o-2025");
        when(shortsCacheService.findByUrlHashAndModelVersion(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(ytDlpService.fetchMetadataAndExtractAudio(anyString()))
                .thenThrow(new BusinessException("AUDIO_EXTRACTION_FAILED", "음성 추출에 실패했습니다",
                        org.springframework.http.HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() -> shortsConvertService.convert(userId, new ShortsConvertRequest(url)))
                .isInstanceOf(BusinessException.class);

        var logCaptor = org.mockito.ArgumentCaptor.forClass(
                com.picook.domain.shorts.entity.ShortsConversionLog.class);
        verify(conversionLogRepository).save(logCaptor.capture());
        var savedLog = logCaptor.getValue();
        assertThat(savedLog.getStatus()).isEqualTo("FAILED");
        assertThat(savedLog.getErrorCode()).isEqualTo("AUDIO_EXTRACTION_FAILED");
        assertThat(savedLog.getTotalMs()).isNotNull();
    }

    @Test
    void 최근_변환_목록_조회() {
        ShortsCache cache = new ShortsCache("https://youtube.com/shorts/abc", "hash", "v1", "김치찌개", null, "{}");
        setFieldSilent(cache, "id", 1);
        setFieldSilent(cache, "createdAt", Instant.now());

        ShortsConversionHistory history = new ShortsConversionHistory(userId, cache);
        setFieldSilent(history, "id", 1);
        setFieldSilent(history, "createdAt", Instant.now());

        when(historyRepository.findRecentByUserIdDistinctUrl(userId)).thenReturn(List.of(history));

        List<RecentShortsResponse> responses = shortsConvertService.getRecentConversions(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("김치찌개");
    }

    private ShortsRecipeResult createRecipeResult() {
        return new ShortsRecipeResult(
                "김치찌개", "맛있는 김치찌개 레시피", 2, 30,
                List.of("김치 300g", "돼지고기 200g", "두부 1모"),
                List.of(
                        new ShortsRecipeResult.ShortsRecipeStep(1, "김치를 썰어주세요", "active", null),
                        new ShortsRecipeResult.ShortsRecipeStep(2, "끓여주세요", "wait", 600)
                )
        );
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }

    private static void setFieldSilent(Object obj, String fieldName, Object value) {
        try {
            setField(obj, fieldName, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
