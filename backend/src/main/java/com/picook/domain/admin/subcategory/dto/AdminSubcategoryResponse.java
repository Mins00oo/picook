package com.picook.domain.admin.subcategory.dto;

import com.picook.domain.ingredient.entity.IngredientSubcategory;

public record AdminSubcategoryResponse(
        Integer id,
        Integer categoryId,
        String categoryName,
        String name,
        String emoji,
        Integer sortOrder
) {
    public static AdminSubcategoryResponse of(IngredientSubcategory s) {
        return new AdminSubcategoryResponse(
                s.getId(),
                s.getCategory().getId(),
                s.getCategory().getName(),
                s.getName(),
                s.getEmoji(),
                s.getSortOrder()
        );
    }
}
