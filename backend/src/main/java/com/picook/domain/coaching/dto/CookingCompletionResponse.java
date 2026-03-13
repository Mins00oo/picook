package com.picook.domain.coaching.dto;

import com.picook.domain.coaching.entity.CookingCompletion;
import com.picook.domain.user.dto.RankInfo;
import java.time.Instant;

public record CookingCompletionResponse(
        Integer id,
        Integer recipeId,
        Integer coachingLogId,
        String photoUrl,
        Instant createdAt,
        RankInfo rankInfo
) {
    public static CookingCompletionResponse of(CookingCompletion completion, RankInfo rankInfo) {
        return new CookingCompletionResponse(
                completion.getId(),
                completion.getRecipeId(),
                completion.getCoachingLogId(),
                completion.getPhotoUrl(),
                completion.getCreatedAt(),
                rankInfo
        );
    }
}
