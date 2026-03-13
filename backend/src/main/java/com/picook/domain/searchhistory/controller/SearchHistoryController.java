package com.picook.domain.searchhistory.controller;

import com.picook.domain.searchhistory.dto.SearchHistoryResponse;
import com.picook.domain.searchhistory.service.SearchHistoryService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/search-history")
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    public SearchHistoryController(SearchHistoryService searchHistoryService) {
        this.searchHistoryService = searchHistoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SearchHistoryResponse>>> getSearchHistory() {
        List<SearchHistoryResponse> responses = searchHistoryService.getSearchHistory(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSearchHistory(@PathVariable Integer id) {
        searchHistoryService.deleteSearchHistory(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAllSearchHistory() {
        searchHistoryService.deleteAllSearchHistory(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
