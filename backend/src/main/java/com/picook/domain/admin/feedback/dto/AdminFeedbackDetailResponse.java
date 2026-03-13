package com.picook.domain.admin.feedback.dto;

import com.picook.domain.feedback.entity.Feedback;

import java.time.Instant;
import java.util.UUID;

public record AdminFeedbackDetailResponse(
        Integer id,
        UUID userId,
        String userDisplayName,
        String userEmail,
        Integer recipeId,
        String recipeTitle,
        String rating,
        String comment,
        String adminStatus,
        String adminNote,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminFeedbackDetailResponse of(Feedback feedback, String userDisplayName,
                                                   String userEmail, String recipeTitle) {
        return new AdminFeedbackDetailResponse(
                feedback.getId(),
                feedback.getUserId(),
                userDisplayName,
                userEmail,
                feedback.getRecipeId(),
                recipeTitle,
                feedback.getRating().getValue(),
                feedback.getComment(),
                feedback.getAdminStatus().getValue(),
                feedback.getAdminNote(),
                feedback.getCreatedAt(),
                feedback.getUpdatedAt()
        );
    }
}
