package com.picook.domain.admin.shorts.dto;

import com.picook.domain.shorts.entity.ShortsCache;

import java.time.Instant;

public record AdminShortsCacheListResponse(
        Integer id,
        String youtubeUrl,
        String title,
        String aiModelVersion,
        String thumbnailUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminShortsCacheListResponse of(ShortsCache cache) {
        return new AdminShortsCacheListResponse(
                cache.getId(),
                cache.getYoutubeUrl(),
                cache.getTitle(),
                cache.getAiModelVersion(),
                cache.getThumbnailUrl(),
                cache.getCreatedAt(),
                cache.getUpdatedAt()
        );
    }
}
