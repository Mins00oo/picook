package com.picook.domain.admin.stats.dto;

import java.util.List;

public record IngredientStatsResponse(
        long totalIngredients,
        List<IngredientItem> top20ByUsage,
        List<UnusedIngredient> unusedIngredients
) {
    public record IngredientItem(Integer id, String name, long usageCount) {}

    public record UnusedIngredient(Integer id, String name) {}
}
