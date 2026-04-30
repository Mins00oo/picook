package com.picook.domain.admin.seed.dto;

import java.util.List;

/**
 * 시드 일괄 업로드 응답.
 * 시트별 처리 결과 + 에러 누적.
 */
public record SeedImportResponse(
        boolean dryRun,
        SheetStat categories,
        SheetStat ingredients,
        SheetStat ingredientSynonyms,
        SheetStat unitConversions,
        SheetStat recipes,
        SheetStat recipeIngredients,
        SheetStat recipeSteps,
        int totalErrors,
        List<SeedError> errors
) {
    public record SheetStat(int total, int success, int failed) {
        public static SheetStat empty() { return new SheetStat(0, 0, 0); }
    }

    public record SeedError(String sheet, int row, String reason) {}
}
