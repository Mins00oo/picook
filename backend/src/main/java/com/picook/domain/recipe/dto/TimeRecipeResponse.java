package com.picook.domain.recipe.dto;

import com.picook.domain.recipe.entity.Recipe;

public record TimeRecipeResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        Integer calories,
        String imageUrl,
        String thumbnailUrl,
        int viewCount
) {
    public static TimeRecipeResponse of(Recipe r) {
        return new TimeRecipeResponse(
                r.getId(),
                r.getTitle(),
                r.getCategory(),
                r.getDifficulty(),
                r.getCookingTimeMinutes(),
                r.getServings(),
                r.getCalories(),
                r.getImageUrl(),
                r.getThumbnailUrl(),
                r.getViewCount() == null ? 0 : r.getViewCount()
        );
    }
}
