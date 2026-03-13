package com.picook.domain.admin.dashboard.dto;

import java.util.Map;

public record DashboardSummaryResponse(
        long totalUsers,
        long activeUsers,
        long totalRecipes,
        long totalCoachingSessions,
        long completedCoachingSessions,
        long totalShortsConversions,
        Map<String, Long> rankDistribution
) {}
