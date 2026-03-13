package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.IngredientSynonym;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientSynonymRepository extends JpaRepository<IngredientSynonym, Integer> {

    List<IngredientSynonym> findAllByIngredientId(Integer ingredientId);
}
