package com.picook.domain.admin.subcategory.service;

import com.picook.domain.admin.subcategory.dto.AdminSubcategoryRequest;
import com.picook.domain.admin.subcategory.dto.AdminSubcategoryResponse;
import com.picook.domain.admin.subcategory.dto.ReorderSubcategoryRequest;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.ingredient.repository.IngredientSubcategoryRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminSubcategoryService {

    private final IngredientSubcategoryRepository subcategoryRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;

    public AdminSubcategoryService(IngredientSubcategoryRepository subcategoryRepository,
                                   IngredientCategoryRepository categoryRepository,
                                   IngredientRepository ingredientRepository) {
        this.subcategoryRepository = subcategoryRepository;
        this.categoryRepository = categoryRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<AdminSubcategoryResponse> list(Integer categoryId) {
        List<IngredientSubcategory> items = (categoryId != null)
                ? subcategoryRepository.findByCategoryIdOrderBySortOrderAsc(categoryId)
                : subcategoryRepository.findAllByOrderBySortOrderAsc();
        return items.stream().map(AdminSubcategoryResponse::of).toList();
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public AdminSubcategoryResponse create(AdminSubcategoryRequest req) {
        IngredientCategory category = loadCategory(req.categoryId());
        String name = req.name().trim();
        if (subcategoryRepository.existsByCategoryIdAndName(category.getId(), name)) {
            throw new BusinessException("SUBCATEGORY_DUPLICATE",
                    "이미 존재하는 서브카테고리입니다", HttpStatus.CONFLICT);
        }
        IngredientSubcategory entity = new IngredientSubcategory(
                category, name, req.emoji(), req.sortOrder()
        );
        subcategoryRepository.save(entity);
        return AdminSubcategoryResponse.of(entity);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public AdminSubcategoryResponse update(Integer id, AdminSubcategoryRequest req) {
        IngredientSubcategory entity = loadSubcategory(id);
        IngredientCategory category = loadCategory(req.categoryId());
        if (!entity.getCategory().getId().equals(category.getId())) {
            throw new BusinessException("SUBCATEGORY_CATEGORY_MISMATCH",
                    "카테고리는 변경할 수 없습니다", HttpStatus.BAD_REQUEST);
        }
        String newName = req.name().trim();
        if (!newName.equals(entity.getName())
                && subcategoryRepository.existsByCategoryIdAndName(category.getId(), newName)) {
            throw new BusinessException("SUBCATEGORY_DUPLICATE",
                    "이미 존재하는 서브카테고리입니다", HttpStatus.CONFLICT);
        }
        entity.setName(newName);
        entity.setEmoji(req.emoji());
        if (req.sortOrder() != null) entity.setSortOrder(req.sortOrder());
        return AdminSubcategoryResponse.of(entity);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public void delete(Integer id) {
        IngredientSubcategory entity = loadSubcategory(id);
        long assigned = ingredientRepository.countBySubcategoryId(id);
        if (assigned > 0) {
            throw new BusinessException("SUBCATEGORY_HAS_INGREDIENTS",
                    "소속 재료가 있어 삭제할 수 없습니다 (" + assigned + "건)", HttpStatus.BAD_REQUEST);
        }
        subcategoryRepository.delete(entity);
    }

    @Transactional
    @CacheEvict(value = "ingredients", allEntries = true)
    public void reorder(ReorderSubcategoryRequest req) {
        List<IngredientSubcategory> existing =
                subcategoryRepository.findByCategoryIdOrderBySortOrderAsc(req.categoryId());
        if (existing.size() != req.orderedIds().size()) {
            throw new BusinessException("SUBCATEGORY_REORDER_MISMATCH",
                    "서브카테고리 수가 일치하지 않습니다", HttpStatus.BAD_REQUEST);
        }
        for (int i = 0; i < req.orderedIds().size(); i++) {
            Integer id = req.orderedIds().get(i);
            IngredientSubcategory sub = existing.stream()
                    .filter(s -> s.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("SUBCATEGORY_NOT_FOUND",
                            "서브카테고리를 찾을 수 없습니다: " + id, HttpStatus.NOT_FOUND));
            sub.setSortOrder(i + 1);
        }
    }

    private IngredientCategory loadCategory(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CATEGORY_NOT_FOUND",
                        "카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }

    private IngredientSubcategory loadSubcategory(Integer id) {
        return subcategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("SUBCATEGORY_NOT_FOUND",
                        "서브카테고리를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
