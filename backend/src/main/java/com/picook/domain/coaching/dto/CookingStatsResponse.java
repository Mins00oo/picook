package com.picook.domain.coaching.dto;

import java.time.Instant;
import java.util.List;

public record CookingStatsResponse(
        long totalCompleted,
        long totalWithPhoto,
        long totalPhotos,
        Instant firstCookingDate,
        List<MonthlyCount> monthlyCount,
        Integer currentLevel,
        String currentTitle,
        String currentEmoji
) {
    public record MonthlyCount(String yearMonth, long count) {}
}
