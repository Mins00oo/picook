package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.AdminIngredientRequest;
import com.picook.domain.admin.ingredient.dto.AdminIngredientResponse;
import com.picook.domain.admin.ingredient.dto.BulkDeleteRequest;
import com.picook.domain.admin.ingredient.dto.BulkDeleteResponse;
import com.picook.domain.admin.ingredient.dto.BulkMoveRequest;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.IngredientSubcategoryRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminIngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final IngredientSubcategoryRepository subcategoryRepository;

    public AdminIngredientService(IngredientRepository ingredientRepository,
                                  IngredientCategoryRepository categoryRepository,
                                  IngredientSubcategoryRepository subcategoryRepository) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
    }

    public PageResponse<AdminIngredientResponse> list(Integer categoryId,
                                                       Integer subcategoryId,
                                                       String keyword,
                                                       Boolean hasSubcategory,
                                                       Boolean hasEmoji,
                                                       int page,
                                                       int size,
                                                       String sort) {
        Sort sorting = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Ingredient> result = ingredientRepository.searchForAdmin(
                categoryId, subcategoryId, keyword, hasSubcategory, hasEmoji, pageable);

        List<Integer> ids = result.getContent().stream().map(Ingredient::getId).toList();
        Map<Integer, Long> usageMap = ids.isEmpty()
                ? Map.of()
                : ingredientRepository.countRecipeUsageByIngredientIds(ids).stream()
                        .collect(Collectors.toMap(
                                row -> (Integer) row[0],
                                row -> ((Number) row[1]).longValue()));

        Page<AdminIngredientResponse> mapped = result.map(i ->
                AdminIngredientResponse.of(i, usageMap.getOrDefault(i.getId(), 0L)));
        return PageResponse.from(mapped);
    }

    public AdminIngredientResponse getIngredient(Integer id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                        "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        return AdminIngredientResponse.of(ingredient, getUsedRecipeCount(id));
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public AdminIngredientResponse createIngredient(AdminIngredientRequest request) {
        String name = request.name().trim();
        if (ingredientRepository.existsByName(name)) {
            throw new BusinessException("DUPLICATE_INGREDIENT",
                    "이미 존재하는 재료명입니다", HttpStatus.BAD_REQUEST);
        }

        IngredientCategory category = loadCategory(request.categoryId());
        IngredientSubcategory subcategory = loadSubcategoryNullable(request.subcategoryId(), category.getId());

        Ingredient ingredient = new Ingredient(name, category);
        ingredient.setSubcategory(subcategory);
        ingredient.setEmoji(request.emoji());
        ingredient.setIconUrl(request.iconUrl());
        applySynonyms(ingredient, request.synonyms(), true);

        ingredientRepository.save(ingredient);
        return AdminIngredientResponse.of(ingredient, 0L);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public AdminIngredientResponse updateIngredient(Integer id, AdminIngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                        "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        String name = request.name().trim();
        ingredientRepository.findByName(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("DUPLICATE_INGREDIENT",
                            "이미 존재하는 재료명입니다", HttpStatus.BAD_REQUEST);
                });

        IngredientCategory category = loadCategory(request.categoryId());
        IngredientSubcategory subcategory = loadSubcategoryNullable(request.subcategoryId(), category.getId());

        ingredient.setName(name);
        ingredient.setCategory(category);
        ingredient.setSubcategory(subcategory);
        ingredient.setEmoji(request.emoji());
        ingredient.setIconUrl(request.iconUrl());
        applySynonyms(ingredient, request.synonyms(), false);

        return AdminIngredientResponse.of(ingredient, getUsedRecipeCount(id));
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public void deleteIngredient(Integer id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INGREDIENT_NOT_FOUND",
                        "재료를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        long recipeCount = getUsedRecipeCount(id);
        if (recipeCount > 0) {
            throw new BusinessException("INGREDIENT_IN_USE",
                    "레시피에서 사용 중인 재료는 삭제할 수 없습니다 (사용 레시피: " + recipeCount + "개)",
                    HttpStatus.BAD_REQUEST);
        }

        ingredientRepository.delete(ingredient);
    }

    private long getUsedRecipeCount(Integer ingredientId) {
        return ingredientRepository.countRecipeUsageByIngredientIds(List.of(ingredientId)).stream()
                .findFirst()
                .map(row -> ((Number) row[1]).longValue())
                .orElse(0L);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public BulkDeleteResponse bulkDelete(BulkDeleteRequest request) {
        List<Integer> ids = request.ids();
        List<Ingredient> found = ingredientRepository.findAllById(ids);
        Map<Integer, Ingredient> foundMap = found.stream()
                .collect(Collectors.toMap(Ingredient::getId, i -> i));

        Map<Integer, Long> usageMap = ids.isEmpty()
                ? Map.of()
                : ingredientRepository.countRecipeUsageByIngredientIds(ids).stream()
                        .collect(Collectors.toMap(
                                row -> (Integer) row[0],
                                row -> ((Number) row[1]).longValue()));

        List<BulkDeleteResponse.SkipReason> skipped = new ArrayList<>();
        List<Ingredient> toDelete = new ArrayList<>();

        for (Integer id : ids) {
            Ingredient ingredient = foundMap.get(id);
            if (ingredient == null) {
                skipped.add(new BulkDeleteResponse.SkipReason(id, "존재하지 않음"));
                continue;
            }
            long usage = usageMap.getOrDefault(id, 0L);
            if (usage > 0) {
                skipped.add(new BulkDeleteResponse.SkipReason(id,
                        "레시피에서 사용 중 (" + usage + "건)"));
                continue;
            }
            toDelete.add(ingredient);
        }

        if (!toDelete.isEmpty()) {
            ingredientRepository.deleteAll(toDelete);
        }

        return new BulkDeleteResponse(ids.size(), toDelete.size(), skipped.size(), skipped);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public void bulkMove(BulkMoveRequest request) {
        IngredientCategory target = loadCategory(request.targetCategoryId());
        IngredientSubcategory targetSub = loadSubcategoryNullable(
                request.targetSubcategoryId(), target.getId());

        List<Integer> ids = request.ids();
        List<Ingredient> items = ingredientRepository.findAllById(ids);

        if (items.size() != ids.size()) {
            Map<Integer, Ingredient> found = new HashMap<>();
            items.forEach(i -> found.put(i.getId(), i));
            List<Integer> missing = ids.stream()
                    .filter(id -> !found.containsKey(id))
                    .toList();
            throw new BusinessException("INGREDIENT_NOT_FOUND",
                    "재료를 찾을 수 없습니다: " + missing, HttpStatus.NOT_FOUND);
        }

        for (Ingredient i : items) {
            i.setCategory(target);
            i.setSubcategory(targetSub);
        }
    }

    private IngredientCategory loadCategory(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND",
                        "카테고리를 찾을 수 없습니다", HttpStatus.BAD_REQUEST));
    }

    private IngredientSubcategory loadSubcategoryNullable(Integer subcategoryId, Integer categoryId) {
        if (subcategoryId == null) return null;
        IngredientSubcategory sub = subcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new BusinessException("SUBCATEGORY_NOT_FOUND",
                        "서브카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        if (!sub.getCategory().getId().equals(categoryId)) {
            throw new BusinessException("SUBCATEGORY_CATEGORY_MISMATCH",
                    "서브카테고리가 선택한 카테고리에 속하지 않습니다", HttpStatus.BAD_REQUEST);
        }
        return sub;
    }

    private void applySynonyms(Ingredient ingredient, List<String> synonyms, boolean creating) {
        if (!creating) {
            ingredient.clearSynonyms();
        }
        if (synonyms == null) return;
        for (String synonym : synonyms) {
            if (synonym == null) continue;
            String trimmed = synonym.trim();
            if (!trimmed.isEmpty()) {
                ingredient.addSynonym(trimmed);
            }
        }
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) return Sort.by("name").ascending();
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        if (parts.length >= 2 && "asc".equalsIgnoreCase(parts[1].trim())) {
            return Sort.by(field).ascending();
        }
        if (parts.length >= 2 && "desc".equalsIgnoreCase(parts[1].trim())) {
            return Sort.by(field).descending();
        }
        return Sort.by(field).ascending();
    }
}
