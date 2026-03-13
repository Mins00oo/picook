package com.picook.domain.admin.shorts.dto;

import com.picook.domain.shorts.entity.ShortsCache;

import java.time.Instant;

public record AdminShortsCacheDetailResponse(
        Integer id,
        String youtubeUrl,
        String urlHash,
        String title,
        String aiModelVersion,
        String thumbnailUrl,
        String result,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminShortsCacheDetailResponse of(ShortsCache cache) {
        return new AdminShortsCacheDetailResponse(
                cache.getId(),
                cache.getYoutubeUrl(),
                cache.getUrlHash(),
                cache.getTitle(),
                cache.getAiModelVersion(),
                cache.getThumbnailUrl(),
                cache.getResult(),
                cache.getCreatedAt(),
                cache.getUpdatedAt()
        );
    }
}
