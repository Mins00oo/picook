package com.picook.domain.recipe.dto;

import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.entity.RecipeStep;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record RecipeDetailResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        Integer calories,
        String imageUrl,
        String thumbnailUrl,
        String tips,
        int totalIngredients,
        int viewCount,
        List<IngredientItem> ingredients,
        List<StepItem> steps,
        Instant createdAt
) {
    public record IngredientItem(
            Integer id,
            Integer ingredientId,
            String ingredientName,
            BigDecimal amount,
            String unit,
            boolean isRequired,
            int sortOrder
    ) {}

    public record StepItem(
            Integer id,
            int stepNumber,
            String description,
            String imageUrl
    ) {}

    public static RecipeDetailResponse of(Recipe recipe) {
        List<IngredientItem> ingredientItems = recipe.getIngredients().stream()
                .map(ri -> new IngredientItem(
                        ri.getId(),
                        ri.getIngredient().getId(),
                        ri.getIngredient().getName(),
                        ri.getAmount(),
                        ri.getUnit(),
                        ri.getIsRequired(),
                        ri.getSortOrder()
                ))
                .toList();

        List<StepItem> stepItems = recipe.getSteps().stream()
                .map(rs -> new StepItem(
                        rs.getId(),
                        rs.getStepNumber(),
                        rs.getDescription(),
                        rs.getImageUrl()
                ))
                .toList();

        return new RecipeDetailResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getCategory(),
                recipe.getDifficulty(),
                recipe.getCookingTimeMinutes(),
                recipe.getServings(),
                recipe.getCalories(),
                recipe.getImageUrl(),
                recipe.getThumbnailUrl(),
                recipe.getTips(),
                recipe.getTotalIngredients(),
                recipe.getViewCount(),
                ingredientItems,
                stepItems,
                recipe.getCreatedAt()
        );
    }
}
