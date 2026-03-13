package com.picook.domain.admin.stats.dto;

import java.util.List;
import java.util.Map;

public record RecipeStatsResponse(
        long totalRecipes,
        Map<String, Long> categoryDistribution,
        Map<String, Long> difficultyDistribution,
        List<RecipeItem> top20,
        double coachingReadyPct
) {
    public record RecipeItem(Integer id, String title, Integer viewCount) {}
}
