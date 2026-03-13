package com.picook.domain.favorite.dto;

import jakarta.validation.constraints.NotNull;

public record AddFavoriteRequest(
        @NotNull(message = "레시피 ID는 필수입니다")
        Integer recipeId
) {}
