package com.picook.domain.admin.subcategory.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReorderSubcategoryRequest(
        @NotNull Integer categoryId,
        @NotEmpty List<Integer> orderedIds
) {}
