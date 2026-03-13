package com.picook.domain.searchhistory.dto;

import com.picook.domain.searchhistory.entity.SearchHistory;

import java.time.Instant;
import java.util.List;

public record SearchHistoryResponse(
        Integer id,
        List<Integer> ingredientIds,
        String filters,
        Integer resultCount,
        Instant createdAt
) {
    public static SearchHistoryResponse of(SearchHistory history) {
        return new SearchHistoryResponse(
                history.getId(),
                history.getIngredientIds(),
                history.getFilters(),
                history.getResultCount(),
                history.getCreatedAt()
        );
    }
}
