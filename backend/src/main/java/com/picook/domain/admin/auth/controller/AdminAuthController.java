package com.picook.domain.admin.auth.controller;

import com.picook.domain.admin.auth.dto.*;
import com.picook.domain.admin.auth.service.AdminAuthService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminAuthResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminAuthResponse response = adminAuthService.login(request.email(), request.password());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AdminAuthResponse>> refresh(@Valid @RequestBody AdminRefreshRequest request) {
        AdminAuthResponse response = adminAuthService.refresh(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminMeResponse>> getMe() {
        Long adminId = Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());
        AdminMeResponse response = adminAuthService.getMe(adminId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody AdminPasswordChangeRequest request) {
        Long adminId = Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());
        adminAuthService.changePassword(adminId, request.currentPassword(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
