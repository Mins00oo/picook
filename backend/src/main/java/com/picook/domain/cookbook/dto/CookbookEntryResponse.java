package com.picook.domain.cookbook.dto;

import com.picook.domain.cookbook.entity.CookbookEntry;
import com.picook.domain.cookbook.entity.CookbookPhoto;
import com.picook.domain.recipe.entity.Recipe;

import java.time.Instant;
import java.util.List;

public record CookbookEntryResponse(
        Long id,
        Integer recipeId,
        String recipeTitle,
        String recipeThumbnailUrl,
        String recipeCategory,
        String recipeDifficulty,
        Integer cookingTimeMinutes,
        Short rating,
        String memo,
        List<String> photoUrls,
        Instant cookedAt,
        Instant createdAt,
        Integer pointsEarned // 생성 시만 포함, list 에서는 null
) {
    public static CookbookEntryResponse of(CookbookEntry e) {
        return of(e, null);
    }

    public static CookbookEntryResponse of(CookbookEntry e, Integer pointsEarned) {
        Recipe r = e.getRecipe();
        List<String> urls = e.getPhotos().stream().map(CookbookPhoto::getPhotoUrl).toList();
        return new CookbookEntryResponse(
                e.getId(),
                r.getId(),
                r.getTitle(),
                r.getThumbnailUrl(),
                r.getCategory(),
                r.getDifficulty(),
                r.getCookingTimeMinutes(),
                e.getRating(),
                e.getMemo(),
                urls,
                e.getCookedAt(),
                e.getCreatedAt(),
                pointsEarned
        );
    }
}
