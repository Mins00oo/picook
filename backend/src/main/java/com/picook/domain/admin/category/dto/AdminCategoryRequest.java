package com.picook.domain.admin.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCategoryRequest(
        @NotBlank(message = "카테고리명은 필수입니다")
        String name,

        @Size(max = 8, message = "이모지는 8자 이하여야 합니다")
        String emoji,

        Integer sortOrder
) {}
