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

    /** 추천 응답의 부족재료 분리용 — 메인/양념을 분리하기 위해 ingredient.isSeasoning 까지 fetch. */
    @Query("SELECT ri FROM RecipeIngredient ri JOIN FETCH ri.ingredient " +
            "WHERE ri.recipe.id IN :recipeIds")
    List<RecipeIngredient> findAllByRecipeIds(@Param("recipeIds") List<Integer> recipeIds);

    @Query("SELECT ri.ingredient.id, ri.ingredient.name, COUNT(ri) FROM RecipeIngredient ri GROUP BY ri.ingredient.id, ri.ingredient.name ORDER BY COUNT(ri) DESC")
    List<Object[]> findTopIngredientsByUsage(Pageable pageable);
}
