package com.picook.domain.admin.account.controller;

import com.picook.domain.admin.account.dto.AdminAccountCreateRequest;
import com.picook.domain.admin.account.dto.AdminAccountListResponse;
import com.picook.domain.admin.account.dto.AdminAccountUpdateRequest;
import com.picook.domain.admin.account.service.AdminAccountService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminAccountListResponse>>> getAccounts() {
        List<AdminAccountListResponse> response = adminAccountService.getAccounts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminAccountListResponse>> createAccount(
            @Valid @RequestBody AdminAccountCreateRequest request) {
        AdminAccountListResponse response = adminAccountService.createAccount(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminAccountListResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AdminAccountUpdateRequest request) {
        AdminAccountListResponse response = adminAccountService.updateAccount(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @PathVariable Long id,
            @RequestHeader("X-Admin-Id") Long currentAdminId) {
        adminAccountService.deleteAccount(id, currentAdminId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<AdminAccountListResponse>> unlockAccount(@PathVariable Long id) {
        AdminAccountListResponse response = adminAccountService.unlockAccount(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
