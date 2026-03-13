package com.picook.domain.ingredient.dto;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientSynonym;

import java.util.List;

public record IngredientResponse(
        Integer id,
        String name,
        String iconUrl,
        Integer categoryId,
        String categoryName,
        List<String> synonyms
) {
    public static IngredientResponse of(Ingredient ingredient) {
        return new IngredientResponse(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getIconUrl(),
                ingredient.getCategory().getId(),
                ingredient.getCategory().getName(),
                ingredient.getSynonyms().stream()
                        .map(IngredientSynonym::getSynonym)
                        .toList()
        );
    }
}
