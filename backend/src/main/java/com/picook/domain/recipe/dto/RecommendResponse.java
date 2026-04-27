package com.picook.domain.recipe.dto;

import java.util.List;

public record RecommendResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        String imageUrl,
        String thumbnailUrl,
        double matchingRate,
        /** 메인재료 중 사용자가 보유하지 않은 것. 매칭률 계산의 분모이기도 함. */
        List<MissingIngredient> missingIngredients,
        /** 양념재료 중 사용자가 보유하지 않은 것. 매칭률에는 포함되지 않으나 부족 정보로 노출. */
        List<MissingIngredient> missingSeasonings
) {
    public record MissingIngredient(Integer id, String name) {}
}
