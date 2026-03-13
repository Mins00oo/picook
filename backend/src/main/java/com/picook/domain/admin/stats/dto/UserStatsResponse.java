package com.picook.domain.admin.stats.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record UserStatsResponse(
        long totalUsers,
        long activeUsers,
        Map<String, Long> loginTypeDistribution,
        List<DailyCount> signupTrend,
        long dau,
        long mau
) {
    public record DailyCount(LocalDate date, long count) {}
}
