package com.picook.domain.admin.recipe.dto;

import com.picook.domain.recipe.entity.Recipe;

import java.time.Instant;

public record AdminRecipeListResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        String thumbnailUrl,
        int totalIngredients,
        int viewCount,
        boolean coachingReady,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminRecipeListResponse of(Recipe recipe) {
        return new AdminRecipeListResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getCategory(),
                recipe.getDifficulty(),
                recipe.getCookingTimeMinutes(),
                recipe.getServings(),
                recipe.getThumbnailUrl(),
                recipe.getTotalIngredients(),
                recipe.getViewCount(),
                recipe.getCoachingReady(),
                recipe.getStatus(),
                recipe.getCreatedAt(),
                recipe.getUpdatedAt()
        );
    }
}
