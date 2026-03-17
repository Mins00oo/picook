package com.picook.domain.recipe.repository;

import com.picook.domain.recipe.entity.RecipeIngredient;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Integer> {

    List<RecipeIngredient> findByRecipeId(Integer recipeId);

    List<RecipeIngredient> findByIngredientIdIn(List<Integer> ingredientIds);

    @Query("SELECT ri FROM RecipeIngredient ri JOIN FETCH ri.ingredient " +
            "WHERE ri.recipe.id IN :recipeIds AND ri.isRequired = true")
    List<RecipeIngredient> findRequiredByRecipeIds(@Param("recipeIds") List<Integer> recipeIds);

    @Query("SELECT ri.ingredient.id, ri.ingredient.name, COUNT(ri) FROM RecipeIngredient ri GROUP BY ri.ingredient.id, ri.ingredient.name ORDER BY COUNT(ri) DESC")
    List<Object[]> findTopIngredientsByUsage(Pageable pageable);
}
