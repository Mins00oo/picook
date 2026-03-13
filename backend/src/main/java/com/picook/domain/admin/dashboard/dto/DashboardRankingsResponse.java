package com.picook.domain.admin.dashboard.dto;

import java.time.Instant;
import java.util.List;

public record DashboardRankingsResponse(
        List<RecipeRanking> topRecipesByViews,
        List<IngredientRanking> topIngredientsByUsage,
        List<RecentFeedback> recentFeedback
) {
    public record RecipeRanking(Integer id, String title, Integer viewCount) {}

    public record IngredientRanking(Integer ingredientId, String ingredientName, long usageCount) {}

    public record RecentFeedback(Integer id, Integer recipeId, String rating, String comment, Instant createdAt) {}
}
