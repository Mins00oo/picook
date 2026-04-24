package com.picook.domain.ingredient.repository;

import com.picook.domain.ingredient.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
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

    long countBySubcategoryId(Integer subcategoryId);

    @Query("SELECT i.category.id, COUNT(i) FROM Ingredient i GROUP BY i.category.id")
    List<Object[]> countGroupByCategoryId();

    boolean existsByCategoryId(Integer categoryId);

    @Query("SELECT i FROM Ingredient i WHERE i.id NOT IN (SELECT DISTINCT ri.ingredient.id FROM RecipeIngredient ri)")
    List<Ingredient> findUnusedIngredients();

    @Query(value = "SELECT i FROM Ingredient i " +
            "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
            "AND (:subcategoryId IS NULL OR i.subcategory.id = :subcategoryId) " +
            "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))) " +
            "AND (:hasSubcategory IS NULL " +
            "     OR (:hasSubcategory = true AND i.subcategory IS NOT NULL) " +
            "     OR (:hasSubcategory = false AND i.subcategory IS NULL)) " +
            "AND (:hasEmoji IS NULL " +
            "     OR (:hasEmoji = true AND i.emoji IS NOT NULL AND i.emoji <> '') " +
            "     OR (:hasEmoji = false AND (i.emoji IS NULL OR i.emoji = '')))")
    Page<Ingredient> searchForAdmin(@Param("categoryId") Integer categoryId,
                                    @Param("subcategoryId") Integer subcategoryId,
                                    @Param("keyword") String keyword,
                                    @Param("hasSubcategory") Boolean hasSubcategory,
                                    @Param("hasEmoji") Boolean hasEmoji,
                                    Pageable pageable);

    @Query("SELECT ri.ingredient.id, COUNT(ri) FROM RecipeIngredient ri " +
            "WHERE ri.ingredient.id IN :ingredientIds " +
            "GROUP BY ri.ingredient.id")
    List<Object[]> countRecipeUsageByIngredientIds(@Param("ingredientIds") List<Integer> ingredientIds);

    @Query("SELECT DISTINCT i FROM Ingredient i " +
            "LEFT JOIN FETCH i.category " +
            "LEFT JOIN FETCH i.subcategory " +
            "LEFT JOIN FETCH i.synonyms " +
            "WHERE (:categoryId IS NULL OR i.category.id = :categoryId) " +
            "AND (:subcategoryId IS NULL OR i.subcategory.id = :subcategoryId) " +
            "AND (:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    List<Ingredient> findForExport(@Param("categoryId") Integer categoryId,
                                   @Param("subcategoryId") Integer subcategoryId,
                                   @Param("keyword") String keyword,
                                   Sort sort);

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.subcategory IS NULL")
    long countMissingSubcategory();

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.emoji IS NULL OR i.emoji = ''")
    long countMissingEmoji();

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.synonyms IS EMPTY")
    long countMissingSynonyms();

    @Query("SELECT COUNT(i) FROM Ingredient i " +
            "WHERE NOT EXISTS (SELECT 1 FROM RecipeIngredient ri WHERE ri.ingredient = i)")
    long countUnusedInRecipes();

    @Query("SELECT i.category.id, i.category.name, COUNT(i) " +
            "FROM Ingredient i GROUP BY i.category.id, i.category.name ORDER BY i.category.id")
    List<Object[]> countByCategoryGrouped();

    @Query("SELECT i.subcategory.id, i.subcategory.name, i.category.id, i.category.name, COUNT(i) " +
            "FROM Ingredient i WHERE i.subcategory IS NOT NULL " +
            "GROUP BY i.subcategory.id, i.subcategory.name, i.category.id, i.category.name, i.subcategory.sortOrder " +
            "ORDER BY i.category.id, i.subcategory.sortOrder")
    List<Object[]> countBySubcategoryGrouped();

    @Query(value = "SELECT CAST(created_at AS DATE) AS day, COUNT(*) FROM ingredients " +
            "WHERE created_at >= :since GROUP BY CAST(created_at AS DATE) ORDER BY day",
            nativeQuery = true)
    List<Object[]> countDailyAdded(@Param("since") Instant since);
}
