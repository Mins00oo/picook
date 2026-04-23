package com.picook.domain.cookbook.dto;

import com.picook.domain.cookbook.entity.CookbookEntry;
import com.picook.domain.cookbook.entity.CookbookPhoto;
import com.picook.domain.outfit.dto.OutfitResponse;
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
        /** 생성 시만 채워짐 (list/detail 응답에서는 null) */
        Integer pointsEarned,
        Integer expEarned,
        Long sequenceNumber,
        Boolean leveledUp,
        Integer newLevel,
        List<OutfitResponse> grantedOutfits
) {
    public static CookbookEntryResponse of(CookbookEntry e) {
        return buildBase(e, null, null, null, null, null, null);
    }

    public static CookbookEntryResponse ofCreated(CookbookEntry e,
                                                  Integer pointsEarned,
                                                  Integer expEarned,
                                                  Long sequenceNumber,
                                                  Boolean leveledUp,
                                                  Integer newLevel,
                                                  List<OutfitResponse> grantedOutfits) {
        return buildBase(e, pointsEarned, expEarned, sequenceNumber, leveledUp, newLevel, grantedOutfits);
    }

    private static CookbookEntryResponse buildBase(CookbookEntry e,
                                                   Integer pointsEarned,
                                                   Integer expEarned,
                                                   Long sequenceNumber,
                                                   Boolean leveledUp,
                                                   Integer newLevel,
                                                   List<OutfitResponse> grantedOutfits) {
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
                pointsEarned,
                expEarned,
                sequenceNumber,
                leveledUp,
                newLevel,
                grantedOutfits
        );
    }
}
