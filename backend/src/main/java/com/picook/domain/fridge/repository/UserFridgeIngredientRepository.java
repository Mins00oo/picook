package com.picook.domain.fridge.repository;

import com.picook.domain.fridge.entity.UserFridgeIngredient;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UserFridgeIngredientRepository extends JpaRepository<UserFridgeIngredient, Long> {

    @EntityGraph(attributePaths = {"ingredient", "ingredient.category"})
    List<UserFridgeIngredient> findByUserIdOrderByAddedAtDesc(UUID userId);

    boolean existsByUserIdAndIngredientId(UUID userId, Integer ingredientId);

    @Modifying
    @Query("DELETE FROM UserFridgeIngredient f WHERE f.userId = :userId AND f.ingredient.id = :ingredientId")
    int deleteByUserIdAndIngredientId(@Param("userId") UUID userId,
                                      @Param("ingredientId") Integer ingredientId);

    @Modifying
    @Query("DELETE FROM UserFridgeIngredient f WHERE f.userId = :userId AND f.ingredient.id IN :ingredientIds")
    int deleteByUserIdAndIngredientIdIn(@Param("userId") UUID userId,
                                        @Param("ingredientIds") Collection<Integer> ingredientIds);
}
