package com.picook.domain.admin.recipe.service;

import com.picook.domain.admin.recipe.dto.*;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.entity.RecipeIngredient;
import com.picook.domain.recipe.entity.RecipeStep;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminRecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    public AdminRecipeService(RecipeRepository recipeRepository,
                              IngredientRepository ingredientRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public PageResponse<AdminRecipeListResponse> getRecipes(String status, String category, String difficulty,
                                                             String keyword,
                                                             int page, int size, String sort) {
        Sort sorting = parseSort(sort);
        PageRequest pageRequest = PageRequest.of(page, size, sorting);
        Page<Recipe> recipePage = recipeRepository.searchRecipes(status, category, difficulty, keyword, pageRequest);
        Page<AdminRecipeListResponse> responsePage = recipePage.map(AdminRecipeListResponse::of);
        return PageResponse.from(responsePage);
    }

    public AdminRecipeResponse getRecipe(Integer id) {
        Recipe recipe = recipeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        return AdminRecipeResponse.of(recipe);
    }

    @Transactional
    @CacheEvict(value = "recipe-category-counts", allEntries = true)
    public AdminRecipeResponse createRecipe(AdminRecipeRequest request) {
        // Validate enums
        validateCategory(request.category());
        validateDifficulty(request.difficulty());

        Recipe recipe = new Recipe(
                request.title(),
                request.category().toLowerCase(),
                request.difficulty().toLowerCase(),
                request.cookingTimeMinutes(),
                request.servings() != null ? request.servings() : 2
        );
        recipe.setCalories(request.calories());
        recipe.setImageUrl(request.imageUrl());
        recipe.setThumbnailUrl(request.thumbnailUrl());
        recipe.setTips(request.tips());

        // 재료 매핑
        if (request.ingredients() != null) {
            for (AdminRecipeRequest.IngredientItem item : request.ingredients()) {
                Ingredient ingredient = ingredientRepository.findById(item.ingredientId())
                        .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                                "재료를 찾을 수 없습니다: ID " + item.ingredientId(), HttpStatus.BAD_REQUEST));
                RecipeIngredient ri = new RecipeIngredient(recipe, ingredient, item.amount(), item.unit(),
                        item.isRequired(), item.sortOrder());
                recipe.addIngredient(ri);
            }
        }

        // 조리 단계
        if (request.steps() != null) {
            for (AdminRecipeRequest.StepItem item : request.steps()) {
                RecipeStep step = new RecipeStep(recipe, item.stepNumber(), item.description(), item.imageUrl());
                recipe.addStep(step);
            }
        }

        recipeRepository.save(recipe);
        return AdminRecipeResponse.of(recipe);
    }

    @Transactional
    @CacheEvict(value = "recipe-category-counts", allEntries = true)
    public AdminRecipeResponse updateRecipe(Integer id, AdminRecipeRequest request) {
        Recipe recipe = findRecipeOrThrow(id);

        validateCategory(request.category());
        validateDifficulty(request.difficulty());

        recipe.setTitle(request.title());
        recipe.setCategory(request.category().toLowerCase());
        recipe.setDifficulty(request.difficulty().toLowerCase());
        recipe.setCookingTimeMinutes(request.cookingTimeMinutes());
        recipe.setServings(request.servings() != null ? request.servings() : recipe.getServings());
        recipe.setCalories(request.calories());
        recipe.setImageUrl(request.imageUrl());
        recipe.setThumbnailUrl(request.thumbnailUrl());
        recipe.setTips(request.tips());

        // 재료 재매핑
        recipe.clearIngredients();
        if (request.ingredients() != null) {
            for (AdminRecipeRequest.IngredientItem item : request.ingredients()) {
                Ingredient ingredient = ingredientRepository.findById(item.ingredientId())
                        .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                                "재료를 찾을 수 없습니다: ID " + item.ingredientId(), HttpStatus.BAD_REQUEST));
                RecipeIngredient ri = new RecipeIngredient(recipe, ingredient, item.amount(), item.unit(),
                        item.isRequired(), item.sortOrder());
                recipe.addIngredient(ri);
            }
        }

        // 단계 재설정
        recipe.clearSteps();
        if (request.steps() != null) {
            for (AdminRecipeRequest.StepItem item : request.steps()) {
                RecipeStep step = new RecipeStep(recipe, item.stepNumber(), item.description(), item.imageUrl());
                recipe.addStep(step);
            }
        }

        return AdminRecipeResponse.of(recipe);
    }

    @Transactional
    @CacheEvict(value = "recipe-category-counts", allEntries = true)
    public void deleteRecipe(Integer id) {
        Recipe recipe = findRecipeOrThrow(id);
        recipe.softDelete();
    }

    @Transactional
    @CacheEvict(value = "recipe-category-counts", allEntries = true)
    public AdminRecipeResponse changeStatus(Integer id, RecipeStatusRequest request) {
        Recipe recipe = findRecipeOrThrow(id);
        String status = request.status().toLowerCase();

        if (!status.equals("draft") && !status.equals("published") && !status.equals("hidden")) {
            throw new BusinessException("INVALID_STATUS", "유효하지 않은 상태입니다: " + request.status(), HttpStatus.BAD_REQUEST);
        }

        recipe.setStatus(status);
        return AdminRecipeResponse.of(recipe);
    }

    private Recipe findRecipeOrThrow(Integer id) {
        return recipeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }

    private void validateCategory(String category) {
        try {
            com.picook.domain.recipe.entity.RecipeCategory.fromValue(category);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_CATEGORY", "유효하지 않은 카테고리입니다: " + category, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateDifficulty(String difficulty) {
        try {
            com.picook.domain.recipe.entity.Difficulty.fromValue(difficulty);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_DIFFICULTY", "유효하지 않은 난이도입니다: " + difficulty, HttpStatus.BAD_REQUEST);
        }
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by("createdAt").descending();
        }
        String[] parts = sort.split(",");
        if (parts.length == 2) {
            return "asc".equalsIgnoreCase(parts[1])
                    ? Sort.by(parts[0]).ascending()
                    : Sort.by(parts[0]).descending();
        }
        return Sort.by(sort).ascending();
    }
}
