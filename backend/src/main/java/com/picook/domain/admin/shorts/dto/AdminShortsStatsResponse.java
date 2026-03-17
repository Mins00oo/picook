package com.picook.domain.admin.shorts.dto;

import java.util.Map;

public record AdminShortsStatsResponse(
        long totalCacheCount,
        long totalConversionCount,
        long successCount,
        long failCount,
        double successRate,
        Double avgProcessingTimeMs,
        Map<String, Long> modelVersionDistribution,
        Map<String, Long> failReasonDistribution,
        long todayConversionCount,
        long cacheHitCount,
        Double avgExtractMs,
        Double avgTranscribeMs,
        Double avgStructurizeMs
) {}

