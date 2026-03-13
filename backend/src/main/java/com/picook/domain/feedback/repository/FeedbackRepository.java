package com.picook.domain.feedback.repository;

import com.picook.domain.feedback.entity.Feedback;
import com.picook.domain.feedback.entity.FeedbackRating;
import com.picook.domain.feedback.entity.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    @Query(value = "SELECT f FROM Feedback f " +
            "WHERE (:status IS NULL OR f.adminStatus = :status) " +
            "AND (:rating IS NULL OR f.rating = :rating) " +
            "AND (:recipeId IS NULL OR f.recipeId = :recipeId)",
            countQuery = "SELECT COUNT(f) FROM Feedback f " +
                    "WHERE (:status IS NULL OR f.adminStatus = :status) " +
                    "AND (:rating IS NULL OR f.rating = :rating) " +
                    "AND (:recipeId IS NULL OR f.recipeId = :recipeId)")
    Page<Feedback> searchFeedback(@Param("status") FeedbackStatus status,
                                   @Param("rating") FeedbackRating rating,
                                   @Param("recipeId") Integer recipeId,
                                   Pageable pageable);

    long countByAdminStatus(FeedbackStatus status);

    long countByRating(FeedbackRating rating);

    @Query("SELECT f.recipeId, COUNT(f) FROM Feedback f WHERE f.rating = :rating GROUP BY f.recipeId ORDER BY COUNT(f) DESC")
    java.util.List<Object[]> findTopRecipesByRating(@Param("rating") FeedbackRating rating, Pageable pageable);
}
