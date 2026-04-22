package com.picook.domain.admin.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardChartsResponse(
        List<DailyCount> userSignups
) {
    public record DailyCount(LocalDate date, long count) {}
}
