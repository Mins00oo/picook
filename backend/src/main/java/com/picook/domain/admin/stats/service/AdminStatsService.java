package com.picook.domain.admin.stats.service;

import com.picook.domain.admin.stats.dto.*;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.UserStatus;
import com.picook.domain.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminStatsService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;

    public AdminStatsService(UserRepository userRepository,
                              RecipeRepository recipeRepository,
                              RecipeIngredientRepository recipeIngredientRepository,
                              IngredientRepository ingredientRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public UserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);

        Map<String, Long> loginTypeDistribution = new LinkedHashMap<>();
        for (LoginType type : LoginType.values()) {
            loginTypeDistribution.put(type.name(), userRepository.countByLoginType(type));
        }

        Instant now = Instant.now();
        Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
        List<UserStatsResponse.DailyCount> signupTrend = userRepository.countDailySignups(thirtyDaysAgo, now)
                .stream()
                .map(row -> {
                    LocalDate date = row[0] instanceof Date sqlDate ? sqlDate.toLocalDate() : (LocalDate) row[0];
                    return new UserStatsResponse.DailyCount(date, ((Number) row[1]).longValue());
                })
                .toList();

        long dau = userRepository.countByLastLoginAtAfter(now.minus(1, ChronoUnit.DAYS));
        long mau = userRepository.countByLastLoginAtAfter(now.minus(30, ChronoUnit.DAYS));

        return new UserStatsResponse(totalUsers, activeUsers, loginTypeDistribution, signupTrend, dau, mau);
    }

    public RecipeStatsResponse getRecipeStats() {
        long totalRecipes = recipeRepository.countByIsDeletedFalse();

        Map<String, Long> categoryDistribution = new LinkedHashMap<>();
        for (Object[] row : recipeRepository.countByCategory()) {
            categoryDistribution.put((String) row[0], (Long) row[1]);
        }

        Map<String, Long> difficultyDistribution = new LinkedHashMap<>();
        for (Object[] row : recipeRepository.countByDifficulty()) {
            difficultyDistribution.put((String) row[0], (Long) row[1]);
        }

        List<RecipeStatsResponse.RecipeItem> top20 = recipeRepository.findTopByViewCount(PageRequest.of(0, 20))
                .stream()
                .map(r -> new RecipeStatsResponse.RecipeItem(r.getId(), r.getTitle(), r.getViewCount()))
                .toList();

        return new RecipeStatsResponse(totalRecipes, categoryDistribution, difficultyDistribution, top20);
    }

    public IngredientStatsResponse getIngredientStats() {
        long totalIngredients = ingredientRepository.count();

        List<IngredientStatsResponse.IngredientItem> top20 = recipeIngredientRepository.findTopIngredientsByUsage(PageRequest.of(0, 20))
                .stream()
                .map(row -> new IngredientStatsResponse.IngredientItem((Integer) row[0], (String) row[1], (Long) row[2]))
                .toList();

        List<IngredientStatsResponse.UnusedIngredient> unused = ingredientRepository.findUnusedIngredients()
                .stream()
                .map(i -> new IngredientStatsResponse.UnusedIngredient(i.getId(), i.getName()))
                .toList();

        return new IngredientStatsResponse(totalIngredients, top20, unused);
    }
}
