package com.picook.domain.outfit.dto;

import jakarta.validation.constraints.NotNull;

public record PurchaseOutfitRequest(
        @NotNull(message = "outfitId는 필수입니다")
        Long outfitId
) {}
