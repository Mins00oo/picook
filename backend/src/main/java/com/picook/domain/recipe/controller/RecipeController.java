package com.picook.domain.recipe.controller;

import com.picook.domain.recipe.dto.CategoryCountResponse;
import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.dto.RecipeSummaryResponse;
import com.picook.domain.recipe.dto.RecommendRequest;
import com.picook.domain.recipe.dto.RecommendResponse;
import com.picook.domain.recipe.dto.TimeRecipeResponse;
import com.picook.domain.recipe.service.RecipeService;
import com.picook.domain.recipe.service.RecommendService;
import com.picook.domain.searchhistory.service.SearchHistoryService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import tools.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "레시피", description = "레시피 추천, 상세 조회")
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

    @GetMapping("/recommend-by-time")
    public ResponseEntity<ApiResponse<List<TimeRecipeResponse>>> recommendByTime(
            @RequestParam String period) {
        return ResponseEntity.ok(ApiResponse.success(recipeService.recommendByTime(period)));
    }

    /** 카테고리별 published 레시피 수 — 카드 그리드 표시용. 0인 카테고리는 응답에서 제외. */
    @GetMapping("/category-counts")
    public ResponseEntity<ApiResponse<List<CategoryCountResponse>>> getCategoryCounts() {
        return ResponseEntity.ok(ApiResponse.success(recipeService.getCategoryCounts()));
    }

    /** 카테고리 카드 탭 시 페이지 조회. category 필수. published 만, view_count DESC. */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RecipeSummaryResponse>>> listByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(recipeService.listByCategory(category, page, size)));
    }

    /** 저칼로리 추천 — calories ≤ 300 + view_count DESC. limit 기본 5, 최대 20. */
    @GetMapping("/recommend-low-calorie")
    public ResponseEntity<ApiResponse<List<RecipeSummaryResponse>>> recommendLowCalorie(
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(ApiResponse.success(recipeService.recommendLowCalorie(limit)));
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
