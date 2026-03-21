package com.picook.domain.monitoring.controller;

import com.picook.domain.admin.dashboard.service.AdminDashboardService;
import com.picook.domain.admin.dashboard.dto.DashboardSummaryResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsStatsResponse;
import com.picook.domain.admin.shorts.service.AdminShortsService;
import com.picook.domain.admin.stats.dto.UserStatsResponse;
import com.picook.domain.admin.stats.service.AdminStatsService;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.monitoring.dto.MonitoringDashboardDto;
import com.picook.domain.monitoring.dto.MonitoringShortsDto;
import com.picook.domain.monitoring.dto.MonitoringUserStatsDto;
import com.picook.domain.shorts.repository.ShortsConversionHistoryRepository;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final AdminStatsService adminStatsService;
    private final AdminDashboardService adminDashboardService;
    private final AdminShortsService adminShortsService;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final CoachingLogRepository coachingLogRepository;
    private final ShortsConversionHistoryRepository shortsConversionHistoryRepository;

    public MonitoringController(AdminStatsService adminStatsService,
                                AdminDashboardService adminDashboardService,
                                AdminShortsService adminShortsService,
                                UserRepository userRepository,
                                IngredientRepository ingredientRepository,
                                CoachingLogRepository coachingLogRepository,
                                ShortsConversionHistoryRepository shortsConversionHistoryRepository) {
        this.adminStatsService = adminStatsService;
        this.adminDashboardService = adminDashboardService;
        this.adminShortsService = adminShortsService;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.coachingLogRepository = coachingLogRepository;
        this.shortsConversionHistoryRepository = shortsConversionHistoryRepository;
    }

    @GetMapping("/users")
    public ApiResponse<?> users() {
        try {
            UserStatsResponse stats = adminStatsService.getUserStats();

            Instant now = Instant.now();
            long wau = userRepository.countByLastLoginAtAfter(now.minus(7, ChronoUnit.DAYS));
            Instant todayStart = now.truncatedTo(ChronoUnit.DAYS);
            long newUsersToday = userRepository.countByCreatedAtBetween(todayStart, now);

            MonitoringUserStatsDto dto = new MonitoringUserStatsDto(
                    stats.dau(),
                    wau,
                    stats.mau(),
                    stats.totalUsers(),
                    newUsersToday
            );
            return ApiResponse.success(dto);
        } catch (Exception e) {
            return ApiResponse.error("SERVICE_UNAVAILABLE", "모니터링 데이터 수집 실패: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> dashboard() {
        try {
            DashboardSummaryResponse summary = adminDashboardService.getSummary();

            Instant now = Instant.now();
            Instant todayStart = now.truncatedTo(ChronoUnit.DAYS);

            long totalIngredients = ingredientRepository.count();
            long totalCoachingToday = coachingLogRepository.countByStartedAtBetween(todayStart, now);
            long totalShortsToday = shortsConversionHistoryRepository.countByCreatedAtBetween(todayStart, now);

            MonitoringDashboardDto dto = new MonitoringDashboardDto(
                    summary.totalRecipes(),
                    totalIngredients,
                    totalCoachingToday,
                    summary.completedCoachingSessions(),
                    totalShortsToday
            );
            return ApiResponse.success(dto);
        } catch (Exception e) {
            return ApiResponse.error("SERVICE_UNAVAILABLE", "모니터링 데이터 수집 실패: " + e.getMessage());
        }
    }

    @GetMapping("/shorts")
    public ApiResponse<?> shorts() {
        try {
            AdminShortsStatsResponse stats = adminShortsService.getStats();

            long totalLogs = stats.successCount() + stats.failCount();
            double cacheHitRate = totalLogs > 0
                    ? (double) stats.cacheHitCount() / totalLogs * 100
                    : 0;
            long avgConversionTimeMs = stats.avgProcessingTimeMs() != null
                    ? stats.avgProcessingTimeMs().longValue()
                    : 0;

            MonitoringShortsDto dto = new MonitoringShortsDto(
                    stats.successRate(),
                    avgConversionTimeMs,
                    cacheHitRate,
                    stats.totalCacheCount()
            );
            return ApiResponse.success(dto);
        } catch (Exception e) {
            return ApiResponse.error("SERVICE_UNAVAILABLE", "모니터링 데이터 수집 실패: " + e.getMessage());
        }
    }
}
