package com.picook.domain.admin.ingredient.dto;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientSynonym;

import java.time.Instant;
import java.util.List;

public record AdminIngredientResponse(
        Integer id,
        String name,
        Integer categoryId,
        String categoryName,
        String iconUrl,
        List<String> synonyms,
        int usedRecipeCount,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminIngredientResponse of(Ingredient ingredient, int usedRecipeCount) {
        return new AdminIngredientResponse(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getCategory().getId(),
                ingredient.getCategory().getName(),
                ingredient.getIconUrl(),
                ingredient.getSynonyms().stream()
                        .map(IngredientSynonym::getSynonym)
                        .toList(),
                usedRecipeCount,
                ingredient.getCreatedAt(),
                ingredient.getUpdatedAt()
        );
    }
}
