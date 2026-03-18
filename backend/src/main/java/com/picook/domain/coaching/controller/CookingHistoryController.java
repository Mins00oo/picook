package com.picook.domain.coaching.controller;

import com.picook.domain.coaching.dto.CookingHistoryDetailResponse;
import com.picook.domain.coaching.dto.CookingHistoryResponse;
import com.picook.domain.coaching.dto.CookingStatsResponse;
import com.picook.domain.coaching.service.CookingHistoryService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "요리 기록", description = "요리 완료 기록 조회")
@RestController
@RequestMapping("/api/v1/cooking")
public class CookingHistoryController {

    private final CookingHistoryService cookingHistoryService;

    public CookingHistoryController(CookingHistoryService cookingHistoryService) {
        this.cookingHistoryService = cookingHistoryService;
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<CookingHistoryResponse>>> getHistory(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CookingHistoryResponse> page = cookingHistoryService.getHistory(getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(page)));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<CookingHistoryDetailResponse>> getHistoryDetail(
            @PathVariable Integer id) {
        CookingHistoryDetailResponse detail = cookingHistoryService.getHistoryDetail(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CookingStatsResponse>> getStats() {
        CookingStatsResponse stats = cookingHistoryService.getStats(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
