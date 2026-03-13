package com.picook.domain.admin.stats.dto;

import java.util.Map;

public record CoachingStatsResponse(
        long totalSessions,
        long completedSessions,
        double completionRate,
        long singleModeSessions,
        long multiModeSessions,
        Map<Integer, Long> hourlyDistribution
) {}
