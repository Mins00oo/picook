package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.IngredientCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IngredientCategoryRepository extends JpaRepository<IngredientCategory, Integer> {

    List<IngredientCategory> findAllByOrderBySortOrderAsc();

    Optional<IngredientCategory> findByName(String name);

    boolean existsByName(String name);
}
