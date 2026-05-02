package com.picook.domain.recipe.service;

import com.picook.domain.recipe.dto.CategoryCountResponse;
import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.dto.RecipeSummaryResponse;
import com.picook.domain.recipe.dto.TimeRecipeResponse;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class RecipeService {

    private static final Set<String> VALID_PERIODS = Set.of("breakfast", "lunch", "dinner", "midnight");

    /** 저칼로리 추천 임계값 (kcal 이하). UI 카피("가볍게 먹고 싶은 날")와 1:1로 묶인 상수. */
    public static final int LOW_CALORIE_THRESHOLD = 300;
    public static final int DEFAULT_LOW_CALORIE_LIMIT = 5;
    public static final int MAX_LOW_CALORIE_LIMIT = 20;

    private final RecipeRepository recipeRepository;

    public RecipeService(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    @Transactional
    public RecipeDetailResponse getRecipeDetail(Integer id) {
        Recipe recipe = recipeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!"published".equals(recipe.getStatus())) {
            throw new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND);
        }

        recipe.incrementViewCount();
        return RecipeDetailResponse.of(recipe);
    }

    /**
     * 시간대별 TOP 5 추천. LLM 으로 분류된 meal_* boolean 컬럼으로 필터, view_count DESC 정렬.
     *
     * API period -> DB 컬럼 매핑:
     *   breakfast -> meal_breakfast
     *   lunch     -> meal_lunch
     *   dinner    -> meal_dinner
     *   midnight  -> meal_snack  (LLM 은 'snack' 카테고리로 분류, 시간대 슬롯은 야식)
     */
    public List<TimeRecipeResponse> recommendByTime(String period) {
        if (period == null || !VALID_PERIODS.contains(period)) {
            throw new BusinessException("INVALID_PERIOD",
                    "period는 breakfast/lunch/dinner/midnight 중 하나여야 합니다", HttpStatus.BAD_REQUEST);
        }
        String column = "midnight".equals(period) ? "snack" : period;
        return recipeRepository.findTopByMealTime(column, PageRequest.of(0, 5)).stream()
                .map(TimeRecipeResponse::of)
                .toList();
    }

    /**
     * 카테고리별 published 레시피 카운트. 카드 그리드 "한식 1248" 표시용.
     * 0인 카테고리는 응답에서 제외 (스키마 8종 중 실제 데이터 있는 것만).
     */
    @Cacheable("recipe-category-counts")
    public List<CategoryCountResponse> getCategoryCounts() {
        List<CategoryCountResponse> result = new ArrayList<>();
        for (Object[] row : recipeRepository.countPublishedByCategory()) {
            result.add(new CategoryCountResponse((String) row[0], (Long) row[1]));
        }
        return result;
    }

    /** 카테고리별 페이지 조회 (published 만, view_count DESC 기본 정렬). */
    public PageResponse<RecipeSummaryResponse> listByCategory(String category, int page, int size) {
        if (category == null || category.isBlank()) {
            throw new BusinessException("INVALID_CATEGORY", "category 는 필수입니다", HttpStatus.BAD_REQUEST);
        }
        int safeSize = Math.min(Math.max(size, 1), 50);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), safeSize,
                Sort.by(Sort.Direction.DESC, "viewCount").and(Sort.by("id")));
        Page<RecipeSummaryResponse> mapped = recipeRepository
                .findPublishedByCategory(category, pageable)
                .map(RecipeSummaryResponse::of);
        return PageResponse.from(mapped);
    }

    /** 저칼로리 추천 — calories ≤ 400, view_count DESC 정렬. */
    public List<RecipeSummaryResponse> recommendLowCalorie(Integer limit) {
        int safeLimit = limit == null ? DEFAULT_LOW_CALORIE_LIMIT
                : Math.min(Math.max(limit, 1), MAX_LOW_CALORIE_LIMIT);
        return recipeRepository
                .findLowCalorieTop(LOW_CALORIE_THRESHOLD, PageRequest.of(0, safeLimit))
                .stream()
                .map(RecipeSummaryResponse::of)
                .toList();
    }
}
