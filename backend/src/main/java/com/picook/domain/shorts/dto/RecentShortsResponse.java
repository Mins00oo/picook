package com.picook.domain.shorts.dto;

import com.picook.domain.shorts.entity.ShortsConversionHistory;

import java.time.Instant;

public record RecentShortsResponse(
        Integer cacheId,
        String youtubeUrl,
        String title,
        String thumbnailUrl,
        Instant convertedAt
) {
    public static RecentShortsResponse of(ShortsConversionHistory history) {
        var cache = history.getShortsCache();
        return new RecentShortsResponse(
                cache.getId(),
                cache.getYoutubeUrl(),
                cache.getTitle(),
                cache.getThumbnailUrl(),
                history.getCreatedAt()
        );
    }
}
