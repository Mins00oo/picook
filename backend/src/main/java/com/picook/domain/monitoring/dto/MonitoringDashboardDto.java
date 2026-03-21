package com.picook.domain.monitoring.dto;

public record MonitoringDashboardDto(
        long totalRecipes,
        long totalIngredients,
        long totalCoachingToday,
        long totalCoachingCompleted,
        long totalShortsToday
) {}
