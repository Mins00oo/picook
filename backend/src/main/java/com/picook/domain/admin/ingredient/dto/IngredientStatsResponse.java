package com.picook.domain.admin.ingredient.dto;

import java.util.List;

public record IngredientStatsResponse(
        long total,
        long missingSubcategory,
        long missingEmoji,
        long missingSynonyms,
        long unusedInRecipes,
        List<CategoryCount> byCategory,
        List<SubcategoryCount> bySubcategory,
        List<DailyCount> last30DaysAdded
) {
    public record CategoryCount(Integer categoryId, String categoryName, long count) {}

    public record SubcategoryCount(Integer subcategoryId, String subcategoryName,
                                   Integer categoryId, String categoryName, long count) {}

    public record DailyCount(String date, long count) {}
}
