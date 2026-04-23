package com.picook.domain.ingredient.dto;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.util.EmojiResolver;

import java.util.List;

public record IngredientResponse(
        Integer id,
        String name,
        Integer categoryId,
        String categoryName,
        String categoryEmoji,
        Integer subcategoryId,
        String subcategoryName,
        String subcategoryEmoji,
        String emoji,          // raw (재료 고유)
        String resolvedEmoji,  // fallback 적용된 최종 값
        String iconUrl,
        List<String> synonyms
) {
    public static IngredientResponse of(Ingredient i) {
        return new IngredientResponse(
                i.getId(),
                i.getName(),
                i.getCategory() != null ? i.getCategory().getId() : null,
                i.getCategory() != null ? i.getCategory().getName() : null,
                i.getCategory() != null ? i.getCategory().getEmoji() : null,
                i.getSubcategory() != null ? i.getSubcategory().getId() : null,
                i.getSubcategory() != null ? i.getSubcategory().getName() : null,
                i.getSubcategory() != null ? i.getSubcategory().getEmoji() : null,
                i.getEmoji(),
                EmojiResolver.resolve(i),
                i.getIconUrl(),
                i.getSynonyms().stream().map(s -> s.getSynonym()).toList()
        );
    }
}
