package com.picook.domain.recipe.dto;

/** 메인 화면 카테고리 카드 그리드용 — published 레시피 카운트. */
public record CategoryCountResponse(
        String category,
        long count
) {}
