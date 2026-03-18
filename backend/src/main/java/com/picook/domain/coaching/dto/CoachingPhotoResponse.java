package com.picook.domain.coaching.dto;

import com.picook.domain.coaching.entity.CoachingPhoto;

public record CoachingPhotoResponse(
        Integer id,
        String photoUrl,
        Integer displayOrder
) {
    public static CoachingPhotoResponse of(CoachingPhoto photo) {
        return new CoachingPhotoResponse(photo.getId(), photo.getPhotoUrl(), photo.getDisplayOrder());
    }
}
