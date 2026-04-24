package com.picook.domain.admin.subcategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminSubcategoryRequest(
        @NotNull Integer categoryId,
        @NotBlank @Size(max = 50) String name,
        @Size(max = 8) String emoji,
        Integer sortOrder
) {}
