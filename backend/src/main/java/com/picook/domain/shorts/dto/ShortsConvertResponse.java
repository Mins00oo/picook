package com.picook.domain.shorts.dto;

import com.picook.domain.shorts.entity.ShortsCache;

import java.time.Instant;

public record ShortsConvertResponse(
        Integer cacheId,
        String youtubeUrl,
        String title,
        String thumbnailUrl,
        ShortsRecipeResult recipe,
        boolean fromCache,
        Instant convertedAt
) {
    public static ShortsConvertResponse of(ShortsCache cache, ShortsRecipeResult recipe, boolean fromCache) {
        return new ShortsConvertResponse(
                cache.getId(),
                cache.getYoutubeUrl(),
                cache.getTitle(),
                cache.getThumbnailUrl(),
                recipe,
                fromCache,
                cache.getCreatedAt()
        );
    }
}
