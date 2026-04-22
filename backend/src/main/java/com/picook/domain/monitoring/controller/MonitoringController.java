package com.picook.domain.monitoring.controller;

import com.picook.domain.admin.dashboard.service.AdminDashboardService;
import com.picook.domain.admin.dashboard.dto.DashboardSummaryResponse;
import com.picook.domain.admin.stats.dto.UserStatsResponse;
import com.picook.domain.admin.stats.service.AdminStatsService;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.monitoring.dto.MonitoringDashboardDto;
import com.picook.domain.monitoring.dto.MonitoringUserStatsDto;
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
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;

    public MonitoringController(AdminStatsService adminStatsService,
                                AdminDashboardService adminDashboardService,
                                UserRepository userRepository,
                                IngredientRepository ingredientRepository) {
        this.adminStatsService = adminStatsService;
        this.adminDashboardService = adminDashboardService;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
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
            long totalIngredients = ingredientRepository.count();

            MonitoringDashboardDto dto = new MonitoringDashboardDto(
                    summary.totalRecipes(),
                    totalIngredients,
                    summary.totalUsers(),
                    summary.activeUsers()
            );
            return ApiResponse.success(dto);
        } catch (Exception e) {
            return ApiResponse.error("SERVICE_UNAVAILABLE", "모니터링 데이터 수집 실패: " + e.getMessage());
        }
    }
}
