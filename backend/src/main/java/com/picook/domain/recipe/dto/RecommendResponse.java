package com.picook.domain.recipe.dto;

import java.util.List;

public record RecommendResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        String imageUrl,
        String thumbnailUrl,
        double matchingRate,
        List<MissingIngredient> missingIngredients
) {
    public record MissingIngredient(Integer id, String name) {}
}
