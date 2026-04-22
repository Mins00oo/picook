package com.picook.domain.fridge.dto;

import com.picook.domain.fridge.entity.UserFridgeIngredient;
import com.picook.domain.ingredient.entity.Ingredient;

import java.time.Instant;

public record FridgeIngredientResponse(
        Long id,
        Integer ingredientId,
        String ingredientName,
        Integer categoryId,
        String categoryName,
        Instant addedAt
) {
    public static FridgeIngredientResponse of(UserFridgeIngredient entity) {
        Ingredient ing = entity.getIngredient();
        return new FridgeIngredientResponse(
                entity.getId(),
                ing.getId(),
                ing.getName(),
                ing.getCategory() != null ? ing.getCategory().getId() : null,
                ing.getCategory() != null ? ing.getCategory().getName() : null,
                entity.getAddedAt()
        );
    }
}
