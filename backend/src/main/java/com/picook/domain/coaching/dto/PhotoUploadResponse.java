package com.picook.domain.coaching.dto;

import java.util.List;

public record PhotoUploadResponse(
        List<CoachingPhotoResponse> photos,
        Integer completedCookingCount,
        Integer level,
        String title,
        String emoji
) {}
