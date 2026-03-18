package com.picook.domain.coaching.dto;

import java.time.Instant;
import java.util.List;

public record CookingHistoryDetailResponse(
        Integer id,
        String mode,
        String title,
        Integer estimatedSeconds,
        Integer actualSeconds,
        Instant startedAt,
        Instant completedAt,
        List<RecipeInfo> recipes,
        List<CoachingPhotoResponse> photos
) {
    public record RecipeInfo(Integer id, String title, String imageUrl) {}
}
