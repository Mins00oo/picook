package com.picook.domain.admin.user.dto;

import com.picook.domain.favorite.entity.Favorite;

import java.time.Instant;

public record AdminUserFavoriteResponse(
        Integer id,
        Integer recipeId,
        String recipeTitle,
        Instant createdAt
) {
    public static AdminUserFavoriteResponse of(Favorite favorite) {
        return new AdminUserFavoriteResponse(
                favorite.getId(),
                favorite.getRecipe().getId(),
                favorite.getRecipe().getTitle(),
                favorite.getCreatedAt()
        );
    }
}
