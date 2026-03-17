package com.picook.domain.shorts.controller;

import com.picook.domain.shorts.dto.RecentShortsResponse;
import com.picook.domain.shorts.dto.ShortsConvertRequest;
import com.picook.domain.shorts.dto.ShortsConvertResponse;
import com.picook.domain.shorts.service.ShortsConvertService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "쇼츠 변환", description = "유튜브 쇼츠 URL → 레시피 변환")
@RestController
@RequestMapping("/api/v1/shorts")
public class ShortsController {

    private final ShortsConvertService shortsConvertService;

    public ShortsController(ShortsConvertService shortsConvertService) {
        this.shortsConvertService = shortsConvertService;
    }

    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<ShortsConvertResponse>> convert(
            @Valid @RequestBody ShortsConvertRequest request) {
        ShortsConvertResponse response = shortsConvertService.convert(getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<RecentShortsResponse>>> getRecentConversions() {
        List<RecentShortsResponse> responses = shortsConvertService.getRecentConversions(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{cacheId}")
    public ResponseEntity<ApiResponse<ShortsConvertResponse>> getCacheDetail(@PathVariable Integer cacheId) {
        ShortsConvertResponse response = shortsConvertService.getCacheDetail(getCurrentUserId(), cacheId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable Integer id) {
        shortsConvertService.deleteHistory(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> deleteAllHistory() {
        shortsConvertService.deleteAllHistory(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
