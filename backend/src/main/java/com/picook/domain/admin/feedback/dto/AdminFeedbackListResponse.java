package com.picook.domain.admin.feedback.dto;

import com.picook.domain.feedback.entity.Feedback;

import java.time.Instant;
import java.util.UUID;

public record AdminFeedbackListResponse(
        Integer id,
        UUID userId,
        String userDisplayName,
        Integer recipeId,
        String recipeTitle,
        String rating,
        String adminStatus,
        Instant createdAt
) {
    public static AdminFeedbackListResponse of(Feedback feedback, String userDisplayName, String recipeTitle) {
        return new AdminFeedbackListResponse(
                feedback.getId(),
                feedback.getUserId(),
                userDisplayName,
                feedback.getRecipeId(),
                recipeTitle,
                feedback.getRating().getValue(),
                feedback.getAdminStatus().getValue(),
                feedback.getCreatedAt()
        );
    }
}
