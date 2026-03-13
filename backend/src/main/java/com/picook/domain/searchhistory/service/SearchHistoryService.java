package com.picook.domain.searchhistory.service;

import com.picook.domain.searchhistory.dto.SearchHistoryResponse;
import com.picook.domain.searchhistory.entity.SearchHistory;
import com.picook.domain.searchhistory.repository.SearchHistoryRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;

    public SearchHistoryService(SearchHistoryRepository searchHistoryRepository) {
        this.searchHistoryRepository = searchHistoryRepository;
    }

    public List<SearchHistoryResponse> getSearchHistory(UUID userId) {
        return searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(SearchHistoryResponse::of)
                .toList();
    }

    @Transactional
    public void saveSearchHistory(UUID userId, List<Integer> ingredientIds, String filters, int resultCount) {
        SearchHistory history = new SearchHistory(userId, ingredientIds, filters, resultCount);
        searchHistoryRepository.save(history);
    }

    @Transactional
    public void deleteSearchHistory(UUID userId, Integer id) {
        SearchHistory history = searchHistoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException("SEARCH_HISTORY_NOT_FOUND", "검색 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        searchHistoryRepository.delete(history);
    }

    @Transactional
    public void deleteAllSearchHistory(UUID userId) {
        searchHistoryRepository.deleteByUserId(userId);
    }
}
