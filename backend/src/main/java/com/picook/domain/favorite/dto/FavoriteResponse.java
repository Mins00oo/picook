package com.picook.domain.favorite.dto;

import com.picook.domain.favorite.entity.Favorite;
import com.picook.domain.recipe.entity.Recipe;

import java.time.Instant;

public record FavoriteResponse(
        Integer id,
        Integer recipeId,
        String recipeTitle,
        String recipeThumbnailUrl,
        String recipeCategory,
        String recipeDifficulty,
        int cookingTimeMinutes,
        Instant createdAt
) {
    public static FavoriteResponse of(Favorite favorite) {
        Recipe recipe = favorite.getRecipe();
        return new FavoriteResponse(
                favorite.getId(),
                recipe.getId(),
                recipe.getTitle(),
                recipe.getThumbnailUrl(),
                recipe.getCategory(),
                recipe.getDifficulty(),
                recipe.getCookingTimeMinutes(),
                favorite.getCreatedAt()
        );
    }
}
