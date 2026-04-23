package com.picook.domain.outfit.dto;

import java.util.List;
import java.util.Map;

public record MyOutfitsResponse(
        List<OutfitResponse> owned,
        /** slot → outfitId (null = 해제) */
        Map<String, Long> equipped
) {}
