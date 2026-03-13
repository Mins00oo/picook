package com.picook.domain.admin.recipe.dto;

import java.util.List;

public record RecipeBulkUploadResponse(
        int total,
        int success,
        int failed,
        List<BulkError> errors
) {
    public record BulkError(int row, String reason) {}
}
