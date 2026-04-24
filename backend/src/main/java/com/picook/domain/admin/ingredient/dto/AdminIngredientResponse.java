package com.picook.domain.admin.ingredient.dto;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.entity.IngredientSynonym;
import com.picook.domain.ingredient.util.EmojiResolver;

import java.time.Instant;
import java.util.List;

public record AdminIngredientResponse(
        Integer id,
        String name,
        Integer categoryId,
        String categoryName,
        String categoryEmoji,
        Integer subcategoryId,
        String subcategoryName,
        String subcategoryEmoji,
        String emoji,
        String resolvedEmoji,
        String iconUrl,
        List<String> synonyms,
        long usedRecipeCount,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminIngredientResponse of(Ingredient ingredient, long usedRecipeCount) {
        IngredientSubcategory sub = ingredient.getSubcategory();
        return new AdminIngredientResponse(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getCategory().getId(),
                ingredient.getCategory().getName(),
                ingredient.getCategory().getEmoji(),
                sub != null ? sub.getId() : null,
                sub != null ? sub.getName() : null,
                sub != null ? sub.getEmoji() : null,
                ingredient.getEmoji(),
                EmojiResolver.resolve(ingredient),
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
