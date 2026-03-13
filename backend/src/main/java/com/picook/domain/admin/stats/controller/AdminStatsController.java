package com.picook.domain.admin.stats.controller;

import com.picook.domain.admin.stats.dto.*;
import com.picook.domain.admin.stats.service.AdminStatsService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    public AdminStatsController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats() {
        UserStatsResponse response = adminStatsService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recipes")
    public ResponseEntity<ApiResponse<RecipeStatsResponse>> getRecipeStats() {
        RecipeStatsResponse response = adminStatsService.getRecipeStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<IngredientStatsResponse>> getIngredientStats() {
        IngredientStatsResponse response = adminStatsService.getIngredientStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/coaching")
    public ResponseEntity<ApiResponse<CoachingStatsResponse>> getCoachingStats() {
        CoachingStatsResponse response = adminStatsService.getCoachingStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/shorts")
    public ResponseEntity<ApiResponse<ShortsStatsResponse>> getShortsStats() {
        ShortsStatsResponse response = adminStatsService.getShortsStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/ranking")
    public ResponseEntity<ApiResponse<RankingStatsResponse>> getRankingStats() {
        RankingStatsResponse response = adminStatsService.getRankingStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
