package com.picook.domain.admin.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record AdminRecipeRequest(
        @NotBlank(message = "레시피명은 필수입니다")
        String title,

        @NotNull(message = "카테고리는 필수입니다")
        String category,

        @NotNull(message = "난이도는 필수입니다")
        String difficulty,

        @NotNull(message = "조리시간은 필수입니다")
        Integer cookingTimeMinutes,

        Integer servings,
        String imageUrl,
        String thumbnailUrl,
        String tips,

        @NotNull(message = "재료 목록은 필수입니다")
        List<IngredientItem> ingredients,

        @NotNull(message = "조리 단계는 필수입니다")
        List<StepItem> steps
) {
    public record IngredientItem(
            Integer ingredientId,
            BigDecimal amount,
            String unit,
            Boolean isRequired,
            Integer sortOrder
    ) {}

    public record StepItem(
            Integer stepNumber,
            String description,
            String imageUrl,
            String stepType,
            Integer durationSeconds,
            Boolean canParallel
    ) {}
}
