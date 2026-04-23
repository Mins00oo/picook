package com.picook.domain.outfit.dto;

import com.picook.domain.outfit.entity.Outfit;

public record OutfitResponse(
        Long id,
        String slot,
        String name,
        String description,
        String imageUrl,
        Integer pricePoints,
        Short unlockLevel,
        Boolean isDefault,
        Boolean isActive,
        Integer sortOrder,
        /** 현재 사용자가 보유 중인지 — 인벤토리 API에서만 채워짐, 카탈로그는 null */
        Boolean owned,
        /** 현재 사용자가 장착 중인지 — 인벤토리 API에서만 채워짐 */
        Boolean equipped
) {
    public static OutfitResponse ofCatalog(Outfit o) {
        return new OutfitResponse(
                o.getId(),
                o.getSlot(),
                o.getName(),
                o.getDescription(),
                o.getImageUrl(),
                o.getPricePoints(),
                o.getUnlockLevel(),
                o.getIsDefault(),
                o.getIsActive(),
                o.getSortOrder(),
                null,
                null
        );
    }

    public static OutfitResponse ofWithOwnership(Outfit o, boolean owned, boolean equipped) {
        return new OutfitResponse(
                o.getId(),
                o.getSlot(),
                o.getName(),
                o.getDescription(),
                o.getImageUrl(),
                o.getPricePoints(),
                o.getUnlockLevel(),
                o.getIsDefault(),
                o.getIsActive(),
                o.getSortOrder(),
                owned,
                equipped
        );
    }
}
