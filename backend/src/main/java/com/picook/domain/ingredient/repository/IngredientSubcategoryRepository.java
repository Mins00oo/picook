package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.IngredientSubcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IngredientSubcategoryRepository extends JpaRepository<IngredientSubcategory, Integer> {
    List<IngredientSubcategory> findByCategoryIdOrderBySortOrderAsc(Integer categoryId);
    List<IngredientSubcategory> findAllByOrderBySortOrderAsc();
    Optional<IngredientSubcategory> findByCategoryIdAndName(Integer categoryId, String name);
    boolean existsByCategoryIdAndName(Integer categoryId, String name);
}
