package com.picook.domain.admin.ingredient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminIngredientRequest(
        @NotBlank(message = "재료명은 필수입니다")
        String name,

        @NotNull(message = "카테고리 ID는 필수입니다")
        Integer categoryId,

        Integer subcategoryId,

        @Size(max = 8, message = "이모지는 8자 이하여야 합니다")
        String emoji,

        String iconUrl,

        List<String> synonyms
) {}
