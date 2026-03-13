package com.picook.domain.admin.feedback.dto;

import java.util.List;
import java.util.Map;

public record AdminFeedbackSummaryResponse(
        long totalCount,
        Map<String, Long> statusDistribution,
        Map<String, Long> ratingDistribution,
        List<DifficultRecipe> topDifficultRecipes
) {
    public record DifficultRecipe(Integer recipeId, String recipeTitle, long count) {}
}
