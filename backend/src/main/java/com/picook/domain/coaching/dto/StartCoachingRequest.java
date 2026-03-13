package com.picook.domain.coaching.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record StartCoachingRequest(
        @NotBlank String mode,
        @NotEmpty List<Integer> recipeIds,
        Integer estimatedSeconds
) {}
