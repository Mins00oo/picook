package com.picook.domain.admin.user.dto;

import com.picook.domain.coaching.entity.CookingCompletion;

import java.time.Instant;

public record AdminUserCompletionResponse(
        Integer id,
        Integer recipeId,
        Integer coachingLogId,
        String photoUrl,
        Instant createdAt
) {
    public static AdminUserCompletionResponse of(CookingCompletion completion) {
        return new AdminUserCompletionResponse(
                completion.getId(),
                completion.getRecipeId(),
                completion.getCoachingLogId(),
                completion.getPhotoUrl(),
                completion.getCreatedAt()
        );
    }
}
