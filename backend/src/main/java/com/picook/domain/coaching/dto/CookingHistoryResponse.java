package com.picook.domain.coaching.dto;

import java.time.Instant;
import java.util.List;

public record CookingHistoryResponse(
        Integer id,
        String mode,
        String title,
        String thumbnailUrl,
        Integer estimatedSeconds,
        Integer actualSeconds,
        Instant completedAt,
        List<CoachingPhotoResponse> photos,
        boolean wasLevelUp
) {}
