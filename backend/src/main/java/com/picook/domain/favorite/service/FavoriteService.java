package com.picook.domain.favorite.service;

import com.picook.domain.favorite.dto.AddFavoriteRequest;
import com.picook.domain.favorite.dto.FavoriteResponse;
import com.picook.domain.favorite.entity.Favorite;
import com.picook.domain.favorite.repository.FavoriteRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FavoriteService {

    private static final int MAX_FAVORITES = 20;

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, RecipeRepository recipeRepository) {
        this.favoriteRepository = favoriteRepository;
        this.recipeRepository = recipeRepository;
    }

    public List<FavoriteResponse> getFavorites(UUID userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(FavoriteResponse::of)
                .toList();
    }

    @Transactional
    public FavoriteResponse addFavorite(UUID userId, AddFavoriteRequest request) {
        if (favoriteRepository.existsByUserIdAndRecipeId(userId, request.recipeId())) {
            throw new BusinessException("FAVORITE_DUPLICATE", "이미 즐겨찾기에 추가된 레시피입니다", HttpStatus.CONFLICT);
        }

        if (favoriteRepository.countByUserId(userId) >= MAX_FAVORITES) {
            throw new BusinessException("FAVORITE_LIMIT", "즐겨찾기는 최대 20개까지 가능합니다", HttpStatus.BAD_REQUEST);
        }

        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(request.recipeId())
                .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        // draft/hidden 레시피 즐겨찾기 방지
        if (!"published".equals(recipe.getStatus())) {
            throw new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND);
        }

        Favorite favorite = new Favorite(userId, recipe);
        favoriteRepository.save(favorite);

        return FavoriteResponse.of(favorite);
    }

    @Transactional
    public void deleteFavorite(UUID userId, Integer favoriteId) {
        Favorite favorite = favoriteRepository.findByIdAndUserId(favoriteId, userId)
                .orElseThrow(() -> new BusinessException("FAVORITE_NOT_FOUND", "즐겨찾기를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        favoriteRepository.delete(favorite);
    }
}
