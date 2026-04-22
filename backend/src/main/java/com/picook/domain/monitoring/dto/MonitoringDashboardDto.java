package com.picook.domain.monitoring.dto;

public record MonitoringDashboardDto(
        long totalRecipes,
        long totalIngredients,
        long totalUsers,
        long activeUsers
) {}
