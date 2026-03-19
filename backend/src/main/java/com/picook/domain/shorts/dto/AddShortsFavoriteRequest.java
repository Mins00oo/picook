package com.picook.domain.shorts.dto;

import jakarta.validation.constraints.NotNull;

public record AddShortsFavoriteRequest(
        @NotNull(message = "쇼츠 캐시 ID는 필수입니다")
        Integer shortsCacheId
) {}
