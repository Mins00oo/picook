package com.picook.domain.admin.recipe.dto;

import jakarta.validation.constraints.NotBlank;

public record RecipeStatusRequest(
        @NotBlank(message = "상태값은 필수입니다")
        String status
) {}
