package com.picook.domain.monitoring.dto;

public record MonitoringUserStatsDto(
        long dau,
        long wau,
        long mau,
        long totalUsers,
        long newUsersToday
) {}
