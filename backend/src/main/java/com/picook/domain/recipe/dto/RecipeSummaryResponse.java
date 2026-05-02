package com.picook.domain.recipe.dto;

import com.picook.domain.recipe.entity.Recipe;

/**
 * 카드형 리스트(카테고리 둘러보기, 저칼로리 추천 등)에 쓰는 공용 요약 DTO.
 * 상세 정보(재료/단계)는 포함하지 않음 — 카드 표시에 필요한 필드만.
 */
public record RecipeSummaryResponse(
        Integer id,
        String title,
        String category,
        String difficulty,
        int cookingTimeMinutes,
        int servings,
        Integer calories,
        String imageUrl,
        String thumbnailUrl,
        int viewCount
) {
    public static RecipeSummaryResponse of(Recipe r) {
        return new RecipeSummaryResponse(
                r.getId(),
                r.getTitle(),
                r.getCategory(),
                r.getDifficulty(),
                r.getCookingTimeMinutes(),
                r.getServings(),
                r.getCalories(),
                r.getImageUrl(),
                r.getThumbnailUrl(),
                r.getViewCount() == null ? 0 : r.getViewCount()
        );
    }
}
