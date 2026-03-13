package com.picook.domain.admin.dashboard.controller;

import com.picook.domain.admin.dashboard.dto.*;
import com.picook.domain.admin.dashboard.service.AdminDashboardService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse response = adminDashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/charts")
    public ResponseEntity<ApiResponse<DashboardChartsResponse>> getCharts(
            @RequestParam(defaultValue = "7d") String period) {
        DashboardChartsResponse response = adminDashboardService.getCharts(period);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rankings")
    public ResponseEntity<ApiResponse<DashboardRankingsResponse>> getRankings() {
        DashboardRankingsResponse response = adminDashboardService.getRankings();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
