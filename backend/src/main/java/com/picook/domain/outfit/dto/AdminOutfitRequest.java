package com.picook.domain.outfit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AdminOutfitRequest(
        @NotBlank(message = "slot은 필수입니다")
        String slot,
        @NotBlank(message = "name은 필수입니다")
        String name,
        String description,
        @NotBlank(message = "imageUrl은 필수입니다")
        String imageUrl,
        @NotNull @PositiveOrZero
        Integer pricePoints,
        /** NULL이면 상점 판매 전용 */
        Short unlockLevel,
        Boolean isDefault,
        Boolean isActive,
        Integer sortOrder
) {}
