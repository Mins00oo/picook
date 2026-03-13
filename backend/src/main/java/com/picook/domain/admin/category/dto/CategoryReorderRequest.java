package com.picook.domain.admin.category.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CategoryReorderRequest(
        @NotEmpty(message = "정렬할 카테고리 ID 목록은 필수입니다")
        List<Integer> orderedIds
) {}
