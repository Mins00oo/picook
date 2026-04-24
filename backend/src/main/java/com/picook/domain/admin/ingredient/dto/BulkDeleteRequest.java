package com.picook.domain.admin.ingredient.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteRequest(
        @NotEmpty(message = "삭제할 재료 ID가 비어있습니다")
        List<Integer> ids
) {}
