package com.picook.domain.recipe.repository;

import com.picook.domain.recipe.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {

    Optional<Recipe> findByIdAndIsDeletedFalse(Integer id);

    @Query("SELECT DISTINCT r FROM Recipe r " +
            "LEFT JOIN FETCH r.ingredients ri " +
            "LEFT JOIN FETCH ri.ingredient " +
            "LEFT JOIN FETCH r.steps " +
            "WHERE r.id = :id AND r.isDeleted = false")
    Optional<Recipe> findByIdWithDetails(@Param("id") Integer id);

    @Query(value = "SELECT r FROM Recipe r " +
            "WHERE r.isDeleted = false " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:category IS NULL OR r.category = :category) " +
            "AND (:difficulty IS NULL OR r.difficulty = :difficulty) " +
            "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))",
            countQuery = "SELECT COUNT(r) FROM Recipe r " +
                    "WHERE r.isDeleted = false " +
                    "AND (:status IS NULL OR r.status = :status) " +
                    "AND (:category IS NULL OR r.category = :category) " +
                    "AND (:difficulty IS NULL OR r.difficulty = :difficulty) " +
                    "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    Page<Recipe> searchRecipes(@Param("status") String status,
                               @Param("category") String category,
                               @Param("difficulty") String difficulty,
                               @Param("keyword") String keyword,
                               Pageable pageable);

    long countByIsDeletedFalse();

    @Query("SELECT r.category, COUNT(r) FROM Recipe r WHERE r.isDeleted = false GROUP BY r.category")
    List<Object[]> countByCategory();

    /** 사용자 화면용 — published 만 카운트. 0인 카테고리는 응답에서 제외됨. */
    @Query("SELECT r.category, COUNT(r) FROM Recipe r " +
            "WHERE r.isDeleted = false AND r.status = 'published' " +
            "GROUP BY r.category")
    List<Object[]> countPublishedByCategory();

    /** 카테고리 필터 페이지 (사용자 화면용 — published 고정). */
    @Query(value = "SELECT r FROM Recipe r " +
            "WHERE r.isDeleted = false AND r.status = 'published' " +
            "AND r.category = :category",
            countQuery = "SELECT COUNT(r) FROM Recipe r " +
                    "WHERE r.isDeleted = false AND r.status = 'published' " +
                    "AND r.category = :category")
    Page<Recipe> findPublishedByCategory(@Param("category") String category, Pageable pageable);

    /** 저칼로리 추천 (사용자 화면용). calories <= maxCalories, view_count DESC. NULL calories 제외. */
    @Query("SELECT r FROM Recipe r " +
            "WHERE r.isDeleted = false AND r.status = 'published' " +
            "AND r.calories IS NOT NULL AND r.calories <= :maxCalories " +
            "ORDER BY r.viewCount DESC, r.calories ASC")
    List<Recipe> findLowCalorieTop(@Param("maxCalories") Integer maxCalories, Pageable pageable);

    @Query("SELECT r.difficulty, COUNT(r) FROM Recipe r WHERE r.isDeleted = false GROUP BY r.difficulty")
    List<Object[]> countByDifficulty();

    @Query("SELECT r FROM Recipe r WHERE r.isDeleted = false ORDER BY r.viewCount DESC")
    List<Recipe> findTopByViewCount(Pageable pageable);

    /**
     * 시간대별 published 레시피 조회. mealColumn 은 'breakfast'|'lunch'|'dinner'|'snack' 중 하나.
     * (서비스 레이어에서 화이트리스트 검증 후 호출)
     */
    @Query("SELECT r FROM Recipe r " +
            "WHERE r.isDeleted = false AND r.status = 'published' " +
            "AND ((:column = 'breakfast' AND r.mealBreakfast = true) " +
            "  OR (:column = 'lunch'     AND r.mealLunch     = true) " +
            "  OR (:column = 'dinner'    AND r.mealDinner    = true) " +
            "  OR (:column = 'snack'     AND r.mealSnack     = true)) " +
            "ORDER BY r.viewCount DESC")
    List<Recipe> findTopByMealTime(@Param("column") String column, Pageable pageable);
}
