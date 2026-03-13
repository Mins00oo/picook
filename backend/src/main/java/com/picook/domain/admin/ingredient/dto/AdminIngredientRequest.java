package com.picook.domain.admin.ingredient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AdminIngredientRequest(
        @NotBlank(message = "재료명은 필수입니다")
        String name,

        @NotNull(message = "카테고리 ID는 필수입니다")
        Integer categoryId,

        String iconUrl,

        List<String> synonyms
) {}
