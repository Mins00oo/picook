package com.picook.domain.admin.category.dto;

import com.picook.domain.ingredient.entity.IngredientCategory;

import java.time.Instant;

public record AdminCategoryResponse(
        Integer id,
        String name,
        String emoji,
        Integer sortOrder,
        int ingredientCount,
        Instant createdAt
) {
    public static AdminCategoryResponse of(IngredientCategory category, int ingredientCount) {
        return new AdminCategoryResponse(
                category.getId(),
                category.getName(),
                category.getEmoji(),
                category.getSortOrder(),
                ingredientCount,
                category.getCreatedAt()
        );
    }
}
