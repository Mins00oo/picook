package com.picook.domain.admin.ingredient.service;

import com.picook.domain.admin.ingredient.dto.IngredientStatsResponse;
import com.picook.domain.ingredient.repository.IngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class IngredientStatsService {

    private final IngredientRepository repository;

    public IngredientStatsService(IngredientRepository repository) {
        this.repository = repository;
    }

    public IngredientStatsResponse getStats() {
        long total = repository.count();
        long missingSub = repository.countMissingSubcategory();
        long missingEmoji = repository.countMissingEmoji();
        long missingSyn = repository.countMissingSynonyms();
        long unused = repository.countUnusedInRecipes();

        List<IngredientStatsResponse.CategoryCount> byCat = repository.countByCategoryGrouped().stream()
                .map(row -> new IngredientStatsResponse.CategoryCount(
                        (Integer) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()))
                .toList();

        List<IngredientStatsResponse.SubcategoryCount> bySub = repository.countBySubcategoryGrouped().stream()
                .map(row -> new IngredientStatsResponse.SubcategoryCount(
                        (Integer) row[0],
                        (String) row[1],
                        (Integer) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue()))
                .toList();

        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);
        List<IngredientStatsResponse.DailyCount> daily = repository.countDailyAdded(since).stream()
                .map(row -> {
                    Object raw = row[0];
                    String date = raw instanceof java.sql.Date d
                            ? d.toLocalDate().toString()
                            : raw.toString();
                    return new IngredientStatsResponse.DailyCount(date, ((Number) row[1]).longValue());
                })
                .toList();

        return new IngredientStatsResponse(
                total, missingSub, missingEmoji, missingSyn, unused,
                byCat, bySub, daily);
    }
}
