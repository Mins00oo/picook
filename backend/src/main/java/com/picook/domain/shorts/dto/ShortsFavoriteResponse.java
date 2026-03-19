package com.picook.domain.shorts.dto;

import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.entity.ShortsFavorite;

import java.time.Instant;

public record ShortsFavoriteResponse(
        Integer id,
        Integer shortsCacheId,
        String youtubeUrl,
        String title,
        String thumbnailUrl,
        String channelName,
        Instant createdAt
) {
    public static ShortsFavoriteResponse of(ShortsFavorite favorite) {
        ShortsCache cache = favorite.getShortsCache();
        return new ShortsFavoriteResponse(
                favorite.getId(),
                cache.getId(),
                cache.getYoutubeUrl(),
                cache.getTitle(),
                cache.getThumbnailUrl(),
                cache.getChannelName(),
                favorite.getCreatedAt()
        );
    }
}
