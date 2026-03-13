package com.picook.domain.recipe.repository;

import com.picook.domain.recipe.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Integer> {

    List<RecipeIngredient> findByRecipeId(Integer recipeId);

    List<RecipeIngredient> findByIngredientIdIn(List<Integer> ingredientIds);
}
