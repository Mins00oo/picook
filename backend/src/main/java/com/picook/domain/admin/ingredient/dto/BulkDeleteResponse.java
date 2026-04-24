package com.picook.domain.admin.ingredient.dto;

import java.util.List;

public record BulkDeleteResponse(
        int requested,
        int deleted,
        int skipped,
        List<SkipReason> skipReasons
) {
    public record SkipReason(Integer id, String reason) {}
}
