package com.picook.domain.outfit.dto;

import jakarta.validation.constraints.NotBlank;

public record EquipOutfitRequest(
        @NotBlank(message = "slot은 필수입니다")
        String slot,
        /** null = 해제 */
        Long outfitId
) {}
