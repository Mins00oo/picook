package com.picook.domain.ingredient.service;

import com.picook.domain.ingredient.dto.CategoryResponse;
import com.picook.domain.ingredient.dto.IngredientResponse;
import com.picook.domain.ingredient.repository.IngredientCategoryRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;

    public IngredientService(IngredientRepository ingredientRepository,
                             IngredientCategoryRepository categoryRepository) {
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<IngredientResponse> getAllIngredients() {
        return ingredientRepository.findAllWithCategoryAndSynonyms().stream()
                .map(IngredientResponse::of)
                .toList();
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(CategoryResponse::of)
                .toList();
    }
}
