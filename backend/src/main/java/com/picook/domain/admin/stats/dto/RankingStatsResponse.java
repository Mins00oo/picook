package com.picook.domain.admin.stats.dto;

import java.util.Map;

public record RankingStatsResponse(
        Map<String, Long> levelDistribution,
        double averageLevel,
        long totalCompletions,
        long photoUploads,
        double photoUploadRate
) {}
