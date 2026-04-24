package com.picook.domain.admin.ingredient.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkMoveRequest(
        @NotEmpty(message = "이동할 재료 ID가 비어있습니다")
        List<Integer> ids,

        @NotNull(message = "대상 카테고리는 필수입니다")
        Integer targetCategoryId,

        Integer targetSubcategoryId
) {}
