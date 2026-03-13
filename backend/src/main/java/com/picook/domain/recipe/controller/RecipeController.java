package com.picook.domain.recipe.controller;

import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.dto.RecommendRequest;
import com.picook.domain.recipe.dto.RecommendResponse;
import com.picook.domain.recipe.service.RecipeService;
import com.picook.domain.recipe.service.RecommendService;
import com.picook.domain.searchhistory.service.SearchHistoryService;
import com.picook.global.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private static final Logger log = LoggerFactory.getLogger(RecipeController.class);

    private final RecommendService recommendService;
    private final RecipeService recipeService;
    private final SearchHistoryService searchHistoryService;
    private final ObjectMapper objectMapper;

    public RecipeController(RecommendService recommendService, RecipeService recipeService,
                            SearchHistoryService searchHistoryService, ObjectMapper objectMapper) {
        this.recommendService = recommendService;
        this.recipeService = recipeService;
        this.searchHistoryService = searchHistoryService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<List<RecommendResponse>>> recommend(
            @Valid @RequestBody RecommendRequest request) {
        List<RecommendResponse> responses = recommendService.recommend(request);

        try {
            UUID userId = getCurrentUserId();
            String filters = buildFiltersJson(request);
            searchHistoryService.saveSearchHistory(userId, request.ingredientIds(), filters, responses.size());
        } catch (Exception e) {
            log.warn("검색기록 저장 실패: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> getRecipeDetail(@PathVariable Integer id) {
        RecipeDetailResponse response = recipeService.getRecipeDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    private String buildFiltersJson(RecommendRequest request) {
        try {
            Map<String, Object> filters = new java.util.LinkedHashMap<>();
            if (request.maxTime() != null) filters.put("maxTime", request.maxTime());
            if (request.difficulty() != null) filters.put("difficulty", request.difficulty());
            if (request.servings() != null) filters.put("servings", request.servings());
            return filters.isEmpty() ? null : objectMapper.writeValueAsString(filters);
        } catch (Exception e) {
            return null;
        }
    }
}
