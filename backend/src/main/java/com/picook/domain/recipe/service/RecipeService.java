package com.picook.domain.recipe.service;

import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecipeService {

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
}
