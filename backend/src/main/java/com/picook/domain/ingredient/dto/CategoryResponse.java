package com.picook.domain.ingredient.dto;

import com.picook.domain.ingredient.entity.IngredientCategory;

public record CategoryResponse(
        Integer id,
        String name,
        Integer sortOrder,
        String emoji
) {
    public static CategoryResponse of(IngredientCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSortOrder(),
                category.getEmoji()
        );
    }
}
