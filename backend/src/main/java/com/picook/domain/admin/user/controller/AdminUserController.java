package com.picook.domain.admin.user.controller;

import com.picook.domain.admin.user.dto.*;
import com.picook.domain.admin.user.service.AdminUserService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "[관리자] 사용자 관리", description = "사용자 조회/정지/활성화 (SUPER_ADMIN)")
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserListResponse>>> getUsers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String loginType,
            @RequestParam(required = false) Integer levelMin,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminUserListResponse> response = adminUserService.getUsers(
                status, loginType, levelMin, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getUser(id)));
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUserSuspendRequest request) {
        adminUserService.suspendUser(id, request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID id) {
        adminUserService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/{id}/search-history")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserSearchHistoryResponse>>> getSearchHistory(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getSearchHistory(id, page, size)));
    }

    @GetMapping("/{id}/favorites")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserFavoriteResponse>>> getFavorites(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getFavorites(id, page, size)));
    }
}
