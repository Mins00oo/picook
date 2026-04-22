package com.picook.domain.admin.dashboard.dto;

import java.util.Map;

public record DashboardSummaryResponse(
        long totalUsers,
        long activeUsers,
        long totalRecipes,
        Map<String, Long> rankDistribution
) {}
