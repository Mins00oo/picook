package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.AdminIngredientRequest;
import com.picook.domain.admin.ingredient.dto.AdminIngredientResponse;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminIngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final EntityManager entityManager;

    public AdminIngredientService(IngredientRepository ingredientRepository,
                                  IngredientCategoryRepository categoryRepository,
                                  EntityManager entityManager) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
        this.entityManager = entityManager;
    }

    @SuppressWarnings("unchecked")
    public PageResponse<AdminIngredientResponse> getIngredients(Integer categoryId, String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Ingredient> ingredientPage = ingredientRepository.searchIngredientsPage(categoryId, keyword, pageRequest);

        // 배치 쿼리로 레시피 사용 수 조회 (N+1 방지)
        List<Integer> ingredientIds = ingredientPage.getContent().stream()
                .map(Ingredient::getId).toList();
        Map<Integer, Integer> recipeCounts = new HashMap<>();
        if (!ingredientIds.isEmpty()) {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT ingredient_id, COUNT(DISTINCT recipe_id) FROM recipe_ingredients " +
                    "WHERE ingredient_id IN (:ids) GROUP BY ingredient_id")
                    .setParameter("ids", ingredientIds)
                    .getResultList();
            for (Object[] row : rows) {
                recipeCounts.put((Integer) row[0], ((Number) row[1]).intValue());
            }
        }

        Page<AdminIngredientResponse> responsePage = ingredientPage.map(ingredient ->
                AdminIngredientResponse.of(ingredient, recipeCounts.getOrDefault(ingredient.getId(), 0))
        );
        return PageResponse.from(responsePage);
    }

    public AdminIngredientResponse getIngredient(Integer id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND", "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        return AdminIngredientResponse.of(ingredient, getUsedRecipeCount(id));
    }

    @Transactional
    public AdminIngredientResponse createIngredient(AdminIngredientRequest request) {
        if (ingredientRepository.existsByName(request.name())) {
            throw new BusinessException("DUPLICATE_INGREDIENT", "이미 존재하는 재료명입니다", HttpStatus.BAD_REQUEST);
        }

        IngredientCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다", HttpStatus.BAD_REQUEST));

        Ingredient ingredient = new Ingredient(request.name(), category);
        ingredient.setIconUrl(request.iconUrl());

        if (request.synonyms() != null) {
            for (String synonym : request.synonyms()) {
                ingredient.addSynonym(synonym.trim());
            }
        }

        ingredientRepository.save(ingredient);
        return AdminIngredientResponse.of(ingredient, 0);
    }

    @Transactional
    public AdminIngredientResponse updateIngredient(Integer id, AdminIngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND", "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        // 이름 중복 체크 (자기 자신 제외)
        ingredientRepository.findByName(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("DUPLICATE_INGREDIENT", "이미 존재하는 재료명입니다", HttpStatus.BAD_REQUEST);
                });

        IngredientCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다", HttpStatus.BAD_REQUEST));

        ingredient.setName(request.name());
        ingredient.setCategory(category);
        ingredient.setIconUrl(request.iconUrl());

        ingredient.clearSynonyms();
        if (request.synonyms() != null) {
            for (String synonym : request.synonyms()) {
                ingredient.addSynonym(synonym.trim());
            }
        }

        return AdminIngredientResponse.of(ingredient, getUsedRecipeCount(id));
    }

    @Transactional
    public void deleteIngredient(Integer id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND", "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        int recipeCount = getUsedRecipeCount(id);
        if (recipeCount > 0) {
            throw new BusinessException("INGREDIENT_IN_USE",
                    "레시피에서 사용 중인 재료는 삭제할 수 없습니다 (사용 레시피: " + recipeCount + "개)", HttpStatus.BAD_REQUEST);
        }

        ingredientRepository.delete(ingredient);
    }

    private int getUsedRecipeCount(Integer ingredientId) {
        return ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(DISTINCT recipe_id) FROM recipe_ingredients WHERE ingredient_id = :ingredientId")
                .setParameter("ingredientId", ingredientId)
                .getSingleResult()).intValue();
    }
}
