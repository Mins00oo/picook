package com.picook.domain.admin.shorts.service;

import com.picook.domain.admin.shorts.dto.AdminShortsStatsResponse;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.shorts.repository.ShortsConversionLogRepository;
import com.picook.domain.shorts.service.ShortsConvertService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminShortsServiceTest {

    @Mock private ShortsCacheRepository shortsCacheRepository;
    @Mock private ShortsConversionHistoryRepository historyRepository;
    @Mock private ShortsConversionLogRepository conversionLogRepository;
    @Mock private ShortsConvertService shortsConvertService;

    private AdminShortsService adminShortsService;

    @BeforeEach
    void setUp() {
        adminShortsService = new AdminShortsService(
                shortsCacheRepository, historyRepository, conversionLogRepository, shortsConvertService
        );
    }

    @Test
    void 통계_응답_13필드_정상_반환() {
        // given
        when(shortsCacheRepository.count()).thenReturn(5L);
        when(historyRepository.count()).thenReturn(20L);
        when(conversionLogRepository.countByStatus("SUCCESS")).thenReturn(18L);
        when(conversionLogRepository.countByStatus("FAILED")).thenReturn(2L);
        when(conversionLogRepository.avgProcessingTimeMs()).thenReturn(12500.0);
        when(conversionLogRepository.countFailuresByErrorCode()).thenReturn(
                List.of(new Object[]{"AUDIO_EXTRACTION_FAILED", 1L}, new Object[]{"NOT_COOKING_VIDEO", 1L})
        );
        when(conversionLogRepository.countByCreatedAtAfter(any())).thenReturn(7L);
        when(conversionLogRepository.countByCacheHit(true)).thenReturn(10L);
        when(conversionLogRepository.avgExtractMs()).thenReturn(3000.0);
        when(conversionLogRepository.avgTranscribeMs()).thenReturn(5000.0);
        when(conversionLogRepository.avgStructurizeMs()).thenReturn(4500.0);

        ShortsCache cache1 = new ShortsCache("url1", "h1", "gpt-4o-2025", "t1", null, "{}");
        ShortsCache cache2 = new ShortsCache("url2", "h2", "gpt-4o-2025", "t2", null, "{}");
        ShortsCache cache3 = new ShortsCache("url3", "h3", "gpt-4o-2026", "t3", null, "{}");
        when(shortsCacheRepository.findAll()).thenReturn(List.of(cache1, cache2, cache3));

        // when
        AdminShortsStatsResponse stats = adminShortsService.getStats();

        // then
        assertThat(stats.totalCacheCount()).isEqualTo(5L);
        assertThat(stats.totalConversionCount()).isEqualTo(20L);
        assertThat(stats.successCount()).isEqualTo(18L);
        assertThat(stats.failCount()).isEqualTo(2L);
        assertThat(stats.successRate()).isEqualTo(90.0);
        assertThat(stats.avgProcessingTimeMs()).isEqualTo(12500.0);
        assertThat(stats.modelVersionDistribution()).containsEntry("gpt-4o-2025", 2L);
        assertThat(stats.modelVersionDistribution()).containsEntry("gpt-4o-2026", 1L);
        assertThat(stats.failReasonDistribution()).containsEntry("AUDIO_EXTRACTION_FAILED", 1L);
        assertThat(stats.failReasonDistribution()).containsEntry("NOT_COOKING_VIDEO", 1L);
        assertThat(stats.todayConversionCount()).isEqualTo(7L);
        assertThat(stats.cacheHitCount()).isEqualTo(10L);
        assertThat(stats.avgExtractMs()).isEqualTo(3000.0);
        assertThat(stats.avgTranscribeMs()).isEqualTo(5000.0);
        assertThat(stats.avgStructurizeMs()).isEqualTo(4500.0);
    }

    @Test
    void 변환_기록_없을때_성공률_0() {
        // given
        when(shortsCacheRepository.count()).thenReturn(0L);
        when(historyRepository.count()).thenReturn(0L);
        when(conversionLogRepository.countByStatus("SUCCESS")).thenReturn(0L);
        when(conversionLogRepository.countByStatus("FAILED")).thenReturn(0L);
        when(conversionLogRepository.avgProcessingTimeMs()).thenReturn(null);
        when(conversionLogRepository.countFailuresByErrorCode()).thenReturn(List.of());
        when(conversionLogRepository.countByCreatedAtAfter(any())).thenReturn(0L);
        when(conversionLogRepository.countByCacheHit(true)).thenReturn(0L);
        when(conversionLogRepository.avgExtractMs()).thenReturn(null);
        when(conversionLogRepository.avgTranscribeMs()).thenReturn(null);
        when(conversionLogRepository.avgStructurizeMs()).thenReturn(null);
        when(shortsCacheRepository.findAll()).thenReturn(List.of());

        // when
        AdminShortsStatsResponse stats = adminShortsService.getStats();

        // then
        assertThat(stats.successRate()).isEqualTo(0.0);
        assertThat(stats.avgProcessingTimeMs()).isNull();
        assertThat(stats.modelVersionDistribution()).isEmpty();
        assertThat(stats.failReasonDistribution()).isEmpty();
    }

    @Test
    void 전부_성공일때_성공률_100() {
        // given
        when(shortsCacheRepository.count()).thenReturn(3L);
        when(historyRepository.count()).thenReturn(10L);
        when(conversionLogRepository.countByStatus("SUCCESS")).thenReturn(10L);
        when(conversionLogRepository.countByStatus("FAILED")).thenReturn(0L);
        when(conversionLogRepository.avgProcessingTimeMs()).thenReturn(8000.0);
        when(conversionLogRepository.countFailuresByErrorCode()).thenReturn(List.of());
        when(conversionLogRepository.countByCreatedAtAfter(any())).thenReturn(3L);
        when(conversionLogRepository.countByCacheHit(true)).thenReturn(7L);
        when(conversionLogRepository.avgExtractMs()).thenReturn(2000.0);
        when(conversionLogRepository.avgTranscribeMs()).thenReturn(3000.0);
        when(conversionLogRepository.avgStructurizeMs()).thenReturn(3000.0);
        when(shortsCacheRepository.findAll()).thenReturn(List.of(
                new ShortsCache("url", "h", "gpt-4o-2025", "t", null, "{}")
        ));

        // when
        AdminShortsStatsResponse stats = adminShortsService.getStats();

        // then
        assertThat(stats.successRate()).isEqualTo(100.0);
        assertThat(stats.failReasonDistribution()).isEmpty();
        assertThat(stats.cacheHitCount()).isEqualTo(7L);
    }
}
