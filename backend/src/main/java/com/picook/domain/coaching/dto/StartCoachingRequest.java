package com.picook.domain.coaching.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record StartCoachingRequest(
        @NotBlank String mode,
        List<Integer> recipeIds,
        Integer shortsCacheId,
        Integer estimatedSeconds
) {}
