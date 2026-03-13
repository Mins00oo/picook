package com.picook.domain.admin.stats.dto;

import java.util.Map;

public record ShortsStatsResponse(
        long totalConversions,
        long totalCacheEntries,
        Map<String, Long> modelVersionDistribution
) {}
