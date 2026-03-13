package com.picook.domain.recipe.repository;

import com.picook.domain.recipe.entity.RecipeIngredient;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Integer> {

    List<RecipeIngredient> findByRecipeId(Integer recipeId);

    List<RecipeIngredient> findByIngredientIdIn(List<Integer> ingredientIds);

    @Query("SELECT ri.ingredient.id, ri.ingredient.name, COUNT(ri) FROM RecipeIngredient ri GROUP BY ri.ingredient.id, ri.ingredient.name ORDER BY COUNT(ri) DESC")
    List<Object[]> findTopIngredientsByUsage(Pageable pageable);
}
