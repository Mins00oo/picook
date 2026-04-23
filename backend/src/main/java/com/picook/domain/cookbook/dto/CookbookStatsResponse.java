package com.picook.domain.cookbook.dto;

public record CookbookStatsResponse(
        String yearMonth,
        long monthlyCount
) {}
