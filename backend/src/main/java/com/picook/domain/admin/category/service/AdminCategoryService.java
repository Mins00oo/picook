package com.picook.domain.admin.category.service;

import com.picook.domain.admin.category.dto.AdminCategoryRequest;
import com.picook.domain.admin.category.dto.AdminCategoryResponse;
import com.picook.domain.admin.category.dto.CategoryReorderRequest;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminCategoryService {

    private final IngredientCategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;

    public AdminCategoryService(IngredientCategoryRepository categoryRepository,
                                IngredientRepository ingredientRepository) {
        this.categoryRepository = categoryRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<AdminCategoryResponse> getAllCategories() {
        List<IngredientCategory> categories = categoryRepository.findAllByOrderBySortOrderAsc();

        // 배치 쿼리로 카테고리별 재료 수 조회 (N+1 방지)
        Map<Integer, Long> countMap = ingredientRepository.countGroupByCategoryId().stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));

        return categories.stream()
                .map(category -> AdminCategoryResponse.of(
                        category,
                        countMap.getOrDefault(category.getId(), 0L).intValue()
                ))
                .toList();
    }

    @Transactional
    public AdminCategoryResponse createCategory(AdminCategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new BusinessException("DUPLICATE_CATEGORY", "이미 존재하는 카테고리명입니다", HttpStatus.BAD_REQUEST);
        }

        Integer sortOrder = request.sortOrder();
        if (sortOrder == null) {
            sortOrder = (int) categoryRepository.count() + 1;
        }

        IngredientCategory category = new IngredientCategory(request.name(), sortOrder);
        categoryRepository.save(category);
        return AdminCategoryResponse.of(category, 0);
    }

    @Transactional
    public AdminCategoryResponse updateCategory(Integer id, AdminCategoryRequest request) {
        IngredientCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        categoryRepository.findByName(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("DUPLICATE_CATEGORY", "이미 존재하는 카테고리명입니다", HttpStatus.BAD_REQUEST);
                });

        category.setName(request.name());
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        return AdminCategoryResponse.of(category, ingredientRepository.countByCategoryId(id));
    }

    @Transactional
    public void deleteCategory(Integer id) {
        IngredientCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (ingredientRepository.existsByCategoryId(id)) {
            throw new BusinessException("CATEGORY_IN_USE", "소속 재료가 있는 카테고리는 삭제할 수 없습니다", HttpStatus.BAD_REQUEST);
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public void reorderCategories(CategoryReorderRequest request) {
        Map<Integer, IngredientCategory> categoryMap = categoryRepository.findAllById(request.orderedIds())
                .stream()
                .collect(Collectors.toMap(IngredientCategory::getId, c -> c));

        for (int i = 0; i < request.orderedIds().size(); i++) {
            Integer categoryId = request.orderedIds().get(i);
            IngredientCategory category = categoryMap.get(categoryId);
            if (category == null) {
                throw new BusinessException("CATEGORY_NOT_FOUND",
                        "카테고리를 찾을 수 없습니다: ID " + categoryId, HttpStatus.BAD_REQUEST);
            }
            category.setSortOrder(i + 1);
        }
    }
}
