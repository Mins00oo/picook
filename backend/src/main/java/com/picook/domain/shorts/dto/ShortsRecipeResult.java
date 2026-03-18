package com.picook.domain.shorts.dto;

import java.util.List;

public record ShortsRecipeResult(
        String title,
        String description,
        int servings,
        int estimatedTimeMinutes,
        List<String> ingredients,
        List<ShortsRecipeStep> steps
) {
    public record ShortsRecipeStep(
            int stepNumber,
            String instruction,
            String type,
            Integer durationSeconds
    ) {
        /**
         * GPT가 stepType이나 durationSeconds를 누락했을 때 기본값을 적용한 인스턴스를 반환.
         * - type 누락 시: "active"
         * - durationSeconds 누락 시: 60
         */
        public ShortsRecipeStep withDefaults() {
            String safeType = (type == null || type.isBlank()) ? "active" : type;
            Integer safeDuration = (durationSeconds == null) ? 60 : durationSeconds;
            return new ShortsRecipeStep(stepNumber, instruction, safeType, safeDuration);
        }
    }

    /**
     * 모든 step에 기본값을 적용한 결과를 반환.
     */
    public ShortsRecipeResult withStepDefaults() {
        if (steps == null) return this;
        List<ShortsRecipeStep> normalized = steps.stream()
                .map(ShortsRecipeStep::withDefaults)
                .toList();
        return new ShortsRecipeResult(title, description, servings, estimatedTimeMinutes, ingredients, normalized);
    }
}
