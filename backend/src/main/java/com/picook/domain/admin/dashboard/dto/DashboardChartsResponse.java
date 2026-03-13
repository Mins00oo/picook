package com.picook.domain.admin.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardChartsResponse(
        List<DailyCount> userSignups,
        List<DailyCount> coachingSessions,
        List<DailyCount> shortsConversions
) {
    public record DailyCount(LocalDate date, long count) {}
}
