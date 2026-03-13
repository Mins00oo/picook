package com.picook.domain.shorts.service;

import com.picook.domain.shorts.dto.ShortsRecipeResult;

public interface RecipeStructurizer {
    ShortsRecipeResult structurize(String transcript);
    String getModelVersion();
}
