package com.picook.domain.admin.dashboard.service;

import com.picook.domain.admin.dashboard.dto.DashboardChartsResponse;
import com.picook.domain.admin.dashboard.dto.DashboardChartsResponse.DailyCount;
import com.picook.domain.admin.dashboard.dto.DashboardRankingsResponse;
import com.picook.domain.admin.dashboard.dto.DashboardRankingsResponse.*;
import com.picook.domain.admin.dashboard.dto.DashboardSummaryResponse;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.feedback.entity.Feedback;
import com.picook.domain.feedback.repository.FeedbackRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeIngredientRepository;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.user.entity.UserRank;
import com.picook.domain.user.entity.UserStatus;
import com.picook.domain.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final CoachingLogRepository coachingLogRepository;
    private final ShortsConversionHistoryRepository shortsConversionHistoryRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final FeedbackRepository feedbackRepository;

    public AdminDashboardService(UserRepository userRepository,
                                  RecipeRepository recipeRepository,
                                  CoachingLogRepository coachingLogRepository,
                                  ShortsConversionHistoryRepository shortsConversionHistoryRepository,
                                  RecipeIngredientRepository recipeIngredientRepository,
                                  FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.coachingLogRepository = coachingLogRepository;
        this.shortsConversionHistoryRepository = shortsConversionHistoryRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public DashboardSummaryResponse getSummary() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long totalRecipes = recipeRepository.countByIsDeletedFalse();
        long totalCoachingSessions = coachingLogRepository.count();
        long completedCoachingSessions = coachingLogRepository.countByCompleted(true);
        long totalShortsConversions = shortsConversionHistoryRepository.count();

        Map<String, Long> rankDistribution = buildRankDistribution();

        return new DashboardSummaryResponse(
                totalUsers, activeUsers, totalRecipes,
                totalCoachingSessions, completedCoachingSessions,
                totalShortsConversions, rankDistribution
        );
    }

    public DashboardChartsResponse getCharts(String period) {
        int days = parsePeriodDays(period);
        Instant end = Instant.now();
        Instant start = end.minus(days, ChronoUnit.DAYS);

        List<DailyCount> userSignups = toDailyCounts(userRepository.countDailySignups(start, end));
        List<DailyCount> coachingSessions = toDailyCounts(coachingLogRepository.countDailySessions(start, end));
        List<DailyCount> shortsConversions = toDailyCounts(shortsConversionHistoryRepository.countDailyConversions(start, end));

        return new DashboardChartsResponse(userSignups, coachingSessions, shortsConversions);
    }

    public DashboardRankingsResponse getRankings() {
        List<RecipeRanking> topRecipes = recipeRepository.findTopByViewCount(PageRequest.of(0, 10))
                .stream()
                .map(r -> new RecipeRanking(r.getId(), r.getTitle(), r.getViewCount()))
                .toList();

        List<IngredientRanking> topIngredients = recipeIngredientRepository.findTopIngredientsByUsage(PageRequest.of(0, 10))
                .stream()
                .map(row -> new IngredientRanking((Integer) row[0], (String) row[1], (Long) row[2]))
                .toList();

        List<RecentFeedback> recentFeedback = feedbackRepository.findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .getContent()
                .stream()
                .map(f -> new RecentFeedback(f.getId(), f.getRecipeId(), f.getRating().getValue(), f.getComment(), f.getCreatedAt()))
                .toList();

        return new DashboardRankingsResponse(topRecipes, topIngredients, recentFeedback);
    }

    private Map<String, Long> buildRankDistribution() {
        List<Object[]> distribution = userRepository.findCookingCountDistribution();
        Map<String, Long> rankCounts = new LinkedHashMap<>();
        for (UserRank rank : UserRank.values()) {
            rankCounts.put(rank.name(), 0L);
        }
        for (Object[] row : distribution) {
            int count = row[0] == null ? 0 : ((Number) row[0]).intValue();
            long users = ((Number) row[1]).longValue();
            UserRank rank = UserRank.fromCount(count);
            rankCounts.merge(rank.name(), users, Long::sum);
        }
        return rankCounts;
    }

    private int parsePeriodDays(String period) {
        if (period == null) return 7;
        return switch (period) {
            case "30d" -> 30;
            case "90d" -> 90;
            default -> 7;
        };
    }

    private List<DailyCount> toDailyCounts(List<Object[]> rows) {
        return rows.stream()
                .map(row -> {
                    LocalDate date;
                    if (row[0] instanceof Date sqlDate) {
                        date = sqlDate.toLocalDate();
                    } else {
                        date = ((java.time.LocalDate) row[0]);
                    }
                    long count = ((Number) row[1]).longValue();
                    return new DailyCount(date, count);
                })
                .toList();
    }
}
