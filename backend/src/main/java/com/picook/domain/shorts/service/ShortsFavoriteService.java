package com.picook.domain.shorts.service;

import com.picook.domain.shorts.dto.AddShortsFavoriteRequest;
import com.picook.domain.shorts.dto.ShortsFavoriteResponse;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.entity.ShortsFavorite;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import com.picook.domain.shorts.repository.ShortsFavoriteRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ShortsFavoriteService {

    private static final int MAX_SHORTS_FAVORITES = 20;

    private final ShortsFavoriteRepository shortsFavoriteRepository;
    private final ShortsCacheRepository shortsCacheRepository;

    public ShortsFavoriteService(ShortsFavoriteRepository shortsFavoriteRepository,
                                 ShortsCacheRepository shortsCacheRepository) {
        this.shortsFavoriteRepository = shortsFavoriteRepository;
        this.shortsCacheRepository = shortsCacheRepository;
    }

    public List<ShortsFavoriteResponse> getFavorites(UUID userId) {
        return shortsFavoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ShortsFavoriteResponse::of)
                .toList();
    }

    @Transactional
    public ShortsFavoriteResponse addFavorite(UUID userId, AddShortsFavoriteRequest request) {
        if (shortsFavoriteRepository.existsByUserIdAndShortsCacheId(userId, request.shortsCacheId())) {
            throw new BusinessException("SHORTS_FAVORITE_DUPLICATE", "이미 즐겨찾기에 추가된 쇼츠입니다", HttpStatus.CONFLICT);
        }

        if (shortsFavoriteRepository.countByUserId(userId) >= MAX_SHORTS_FAVORITES) {
            throw new BusinessException("SHORTS_FAVORITE_LIMIT", "쇼츠 즐겨찾기는 최대 20개까지 가능합니다", HttpStatus.BAD_REQUEST);
        }

        ShortsCache shortsCache = shortsCacheRepository.findById(request.shortsCacheId())
                .orElseThrow(() -> new BusinessException("SHORTS_CACHE_NOT_FOUND", "쇼츠 변환 결과를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        ShortsFavorite favorite = new ShortsFavorite(userId, shortsCache);
        shortsFavoriteRepository.save(favorite);

        return ShortsFavoriteResponse.of(favorite);
    }

    @Transactional
    public void deleteFavorite(UUID userId, Integer favoriteId) {
        ShortsFavorite favorite = shortsFavoriteRepository.findByIdAndUserId(favoriteId, userId)
                .orElseThrow(() -> new BusinessException("SHORTS_FAVORITE_NOT_FOUND", "쇼츠 즐겨찾기를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        shortsFavoriteRepository.delete(favorite);
    }
}
