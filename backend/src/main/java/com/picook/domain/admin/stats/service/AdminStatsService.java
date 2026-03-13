package com.picook.domain.admin.stats.service;

import com.picook.domain.admin.stats.dto.*;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.coaching.repository.CookingCompletionRepository;
import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.shorts.repository.ShortsCacheRepository;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.UserRank;
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
    private final CoachingLogRepository coachingLogRepository;
    private final CookingCompletionRepository cookingCompletionRepository;
    private final ShortsCacheRepository shortsCacheRepository;
    private final ShortsConversionHistoryRepository shortsConversionHistoryRepository;

    public AdminStatsService(UserRepository userRepository,
                              RecipeRepository recipeRepository,
                              RecipeIngredientRepository recipeIngredientRepository,
                              IngredientRepository ingredientRepository,
                              CoachingLogRepository coachingLogRepository,
                              CookingCompletionRepository cookingCompletionRepository,
                              ShortsCacheRepository shortsCacheRepository,
                              ShortsConversionHistoryRepository shortsConversionHistoryRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.ingredientRepository = ingredientRepository;
        this.coachingLogRepository = coachingLogRepository;
        this.cookingCompletionRepository = cookingCompletionRepository;
        this.shortsCacheRepository = shortsCacheRepository;
        this.shortsConversionHistoryRepository = shortsConversionHistoryRepository;
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

        long coachingReady = recipeRepository.countCoachingReady();
        double coachingReadyPct = totalRecipes > 0 ? (double) coachingReady / totalRecipes * 100 : 0;

        return new RecipeStatsResponse(totalRecipes, categoryDistribution, difficultyDistribution, top20, coachingReadyPct);
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

    public CoachingStatsResponse getCoachingStats() {
        long totalSessions = coachingLogRepository.count();
        long completedSessions = coachingLogRepository.countByCompleted(true);
        double completionRate = totalSessions > 0 ? (double) completedSessions / totalSessions * 100 : 0;

        long singleModeSessions = coachingLogRepository.countByMode("single");
        long multiModeSessions = coachingLogRepository.countByMode("multi");

        Map<Integer, Long> hourlyDistribution = new LinkedHashMap<>();
        for (int i = 0; i < 24; i++) {
            hourlyDistribution.put(i, 0L);
        }
        for (Object[] row : coachingLogRepository.findHourlyDistribution()) {
            int hour = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            hourlyDistribution.put(hour, count);
        }

        return new CoachingStatsResponse(totalSessions, completedSessions, completionRate,
                singleModeSessions, multiModeSessions, hourlyDistribution);
    }

    public ShortsStatsResponse getShortsStats() {
        long totalConversions = shortsConversionHistoryRepository.count();
        long totalCacheEntries = shortsCacheRepository.count();

        Map<String, Long> modelVersionDistribution = new LinkedHashMap<>();
        for (Object[] row : shortsCacheRepository.countByModelVersion()) {
            modelVersionDistribution.put((String) row[0], (Long) row[1]);
        }

        return new ShortsStatsResponse(totalConversions, totalCacheEntries, modelVersionDistribution);
    }

    public RankingStatsResponse getRankingStats() {
        Map<String, Long> levelDistribution = new LinkedHashMap<>();
        for (UserRank rank : UserRank.values()) {
            levelDistribution.put(rank.name(), 0L);
        }

        List<Object[]> distribution = userRepository.findCookingCountDistribution();
        long totalWeighted = 0;
        long totalUsers = 0;

        for (Object[] row : distribution) {
            int count = row[0] == null ? 0 : ((Number) row[0]).intValue();
            long users = ((Number) row[1]).longValue();
            UserRank rank = UserRank.fromCount(count);
            levelDistribution.merge(rank.name(), users, Long::sum);
            totalWeighted += (long) rank.getLevel() * users;
            totalUsers += users;
        }

        double averageLevel = totalUsers > 0 ? (double) totalWeighted / totalUsers : 0;

        long totalCompletions = cookingCompletionRepository.count();
        long photoUploads = cookingCompletionRepository.countByPhotoUrlIsNotNull();
        double photoUploadRate = totalCompletions > 0 ? (double) photoUploads / totalCompletions * 100 : 0;

        return new RankingStatsResponse(levelDistribution, averageLevel, totalCompletions, photoUploads, photoUploadRate);
    }
}
