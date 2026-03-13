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
    ) {}
}
