package com.picook.domain.recipe.repository;

import com.picook.domain.recipe.entity.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeStepRepository extends JpaRepository<RecipeStep, Integer> {

    List<RecipeStep> findByRecipeIdOrderByStepNumber(Integer recipeId);
}
