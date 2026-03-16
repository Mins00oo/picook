package com.picook.domain.admin.shorts.controller;

import com.picook.domain.admin.shorts.dto.AdminShortsCacheDetailResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsCacheListResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsStatsResponse;
import com.picook.domain.admin.shorts.service.AdminShortsService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "[관리자] 쇼츠 캐시", description = "쇼츠 캐시 관리, 재변환, 통계")
@RestController
@RequestMapping("/api/admin/shorts")
public class AdminShortsController {

    private final AdminShortsService adminShortsService;

    public AdminShortsController(AdminShortsService adminShortsService) {
        this.adminShortsService = adminShortsService;
    }

    @GetMapping("/cache")
    public ResponseEntity<ApiResponse<PageResponse<AdminShortsCacheListResponse>>> getCacheList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String modelVersion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminShortsCacheListResponse> response = adminShortsService.getCacheList(keyword, modelVersion, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/cache/{id}")
    public ResponseEntity<ApiResponse<AdminShortsCacheDetailResponse>> getCacheDetail(@PathVariable Integer id) {
        AdminShortsCacheDetailResponse response = adminShortsService.getCacheDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/cache/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCache(@PathVariable Integer id) {
        adminShortsService.deleteCache(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/cache/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAllCache() {
        adminShortsService.clearAllCache();
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/cache/{id}/reconvert")
    public ResponseEntity<ApiResponse<AdminShortsCacheDetailResponse>> reconvert(@PathVariable Integer id) {
        AdminShortsCacheDetailResponse response = adminShortsService.reconvert(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminShortsStatsResponse>> getStats() {
        AdminShortsStatsResponse response = adminShortsService.getStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
