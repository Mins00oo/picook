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

    @Query(value = "SELECT r FROM Recipe r " +
            "WHERE r.isDeleted = false " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:category IS NULL OR r.category = :category) " +
            "AND (:difficulty IS NULL OR r.difficulty = :difficulty) " +
            "AND (:coachingReady IS NULL OR r.coachingReady = :coachingReady) " +
            "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))",
            countQuery = "SELECT COUNT(r) FROM Recipe r " +
                    "WHERE r.isDeleted = false " +
                    "AND (:status IS NULL OR r.status = :status) " +
                    "AND (:category IS NULL OR r.category = :category) " +
                    "AND (:difficulty IS NULL OR r.difficulty = :difficulty) " +
                    "AND (:coachingReady IS NULL OR r.coachingReady = :coachingReady) " +
                    "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    Page<Recipe> searchRecipes(@Param("status") String status,
                               @Param("category") String category,
                               @Param("difficulty") String difficulty,
                               @Param("coachingReady") Boolean coachingReady,
                               @Param("keyword") String keyword,
                               Pageable pageable);

    long countByIsDeletedFalse();

    @Query("SELECT r.category, COUNT(r) FROM Recipe r WHERE r.isDeleted = false GROUP BY r.category")
    List<Object[]> countByCategory();

    @Query("SELECT r.difficulty, COUNT(r) FROM Recipe r WHERE r.isDeleted = false GROUP BY r.difficulty")
    List<Object[]> countByDifficulty();

    @Query("SELECT r FROM Recipe r WHERE r.isDeleted = false ORDER BY r.viewCount DESC")
    List<Recipe> findTopByViewCount(Pageable pageable);

    @Query("SELECT COUNT(r) FROM Recipe r WHERE r.isDeleted = false AND r.coachingReady = true")
    long countCoachingReady();
}
