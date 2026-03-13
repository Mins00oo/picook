package com.picook.domain.admin.ingredient.dto;

import java.util.List;

public record IngredientBulkUploadResponse(
        int total,
        int success,
        int failed,
        List<BulkError> errors
) {
    public record BulkError(int row, String reason) {}
}
