package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {

    List<Ingredient> findAllByCategoryId(Integer categoryId);

    Optional<Ingredient> findByName(String name);

    boolean existsByName(String name);

    List<Ingredient> findByNameIn(List<String> names);

    List<Ingredient> findAllByIdIn(List<Integer> ids);

    @Query("SELECT i FROM Ingredient i JOIN FETCH i.category LEFT JOIN FETCH i.synonyms")
    List<Ingredient> findAllWithCategoryAndSynonyms();

    @Query("SELECT i FROM Ingredient i JOIN FETCH i.category LEFT JOIN FETCH i.synonyms " +
            "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    List<Ingredient> searchIngredients(@Param("categoryId") Integer categoryId,
                                       @Param("keyword") String keyword);

    @Query(value = "SELECT i FROM Ingredient i JOIN FETCH i.category " +
            "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))",
            countQuery = "SELECT COUNT(i) FROM Ingredient i " +
                    "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
                    "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    Page<Ingredient> searchIngredientsPage(@Param("categoryId") Integer categoryId,
                                            @Param("keyword") String keyword,
                                            Pageable pageable);

    int countByCategoryId(Integer categoryId);

    @Query("SELECT i.category.id, COUNT(i) FROM Ingredient i GROUP BY i.category.id")
    List<Object[]> countGroupByCategoryId();

    boolean existsByCategoryId(Integer categoryId);

    @Query("SELECT i FROM Ingredient i WHERE i.id NOT IN (SELECT DISTINCT ri.ingredient.id FROM RecipeIngredient ri)")
    List<Ingredient> findUnusedIngredients();
}
