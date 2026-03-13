package com.picook.domain.admin.user.dto;

import com.picook.domain.searchhistory.entity.SearchHistory;

import java.time.Instant;
import java.util.List;

public record AdminUserSearchHistoryResponse(
        Integer id,
        List<Integer> ingredientIds,
        String filters,
        Integer resultCount,
        Instant createdAt
) {
    public static AdminUserSearchHistoryResponse of(SearchHistory history) {
        return new AdminUserSearchHistoryResponse(
                history.getId(),
                history.getIngredientIds(),
                history.getFilters(),
                history.getResultCount(),
                history.getCreatedAt()
        );
    }
}
