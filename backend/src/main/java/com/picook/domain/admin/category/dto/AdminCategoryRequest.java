package com.picook.domain.admin.category.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminCategoryRequest(
        @NotBlank(message = "카테고리명은 필수입니다")
        String name,

        Integer sortOrder
) {}
