package com.picook.domain.admin.shorts.dto;

import java.util.Map;

public record AdminShortsStatsResponse(
        long totalCacheCount,
        long totalConversionCount,
        Map<String, Long> modelVersionDistribution
) {}
