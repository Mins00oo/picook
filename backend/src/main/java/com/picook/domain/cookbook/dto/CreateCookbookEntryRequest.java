package com.picook.domain.cookbook.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Multipart 요청의 form-field 부분.
 * photos[] 는 별도 @RequestParam MultipartFile[] 로 받음.
 */
public record CreateCookbookEntryRequest(
        @NotNull Integer recipeId,
        @NotNull @Min(1) @Max(5) Short rating,
        @Size(max = 1000) String memo
) {}
