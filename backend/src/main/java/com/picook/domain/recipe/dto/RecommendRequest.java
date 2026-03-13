package com.picook.domain.recipe.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record RecommendRequest(
        @NotEmpty(message = "재료 목록은 필수입니다")
        List<Integer> ingredientIds,
        Integer maxTime,
        String difficulty,
        Integer servings
) {}
