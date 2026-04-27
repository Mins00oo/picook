package com.picook.domain.recipe.service;

import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.dto.TimeRecipeResponse;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class RecipeService {

    private static final Set<String> VALID_PERIODS = Set.of("breakfast", "lunch", "afternoon", "dinner", "midnight");

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
     * 시간대별 TOP 5 추천. MVP: 기존 view_count 가중치로 정렬.
     * period는 유효성만 검증하고 필터로는 사용하지 않음 (데이터가 쌓이기 전까지 공통 순위).
     */
    public List<TimeRecipeResponse> recommendByTime(String period) {
        if (period == null || !VALID_PERIODS.contains(period)) {
            throw new BusinessException("INVALID_PERIOD",
                    "period는 breakfast/lunch/afternoon/dinner/midnight 중 하나여야 합니다", HttpStatus.BAD_REQUEST);
        }
        return recipeRepository.findTopByViewCount(PageRequest.of(0, 5)).stream()
                .filter(r -> "published".equals(r.getStatus()))
                .map(TimeRecipeResponse::of)
                .toList();
    }
}
