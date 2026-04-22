package com.picook.domain.admin.stats.controller;

import com.picook.domain.admin.stats.dto.*;
import com.picook.domain.admin.stats.service.AdminStatsService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "[관리자] 상세 통계", description = "사용자/레시피/재료 통계")
@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    public AdminStatsController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getUserStats()));
    }

    @GetMapping("/recipes")
    public ResponseEntity<ApiResponse<RecipeStatsResponse>> getRecipeStats() {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getRecipeStats()));
    }

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<IngredientStatsResponse>> getIngredientStats() {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getIngredientStats()));
    }
}
