package com.picook.domain.admin.auth.controller;

import com.picook.domain.admin.auth.dto.AdminAuthResponse;
import com.picook.domain.admin.auth.dto.AdminLoginRequest;
import com.picook.domain.admin.auth.service.AdminAuthService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
