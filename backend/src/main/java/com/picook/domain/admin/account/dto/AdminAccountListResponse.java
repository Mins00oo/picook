package com.picook.domain.admin.account.dto;

import com.picook.domain.admin.auth.entity.AdminUser;

import java.time.Instant;

public record AdminAccountListResponse(
        Long id,
        String email,
        String role,
        Boolean isLocked,
        Instant lastLoginAt,
        Instant createdAt
) {
    public static AdminAccountListResponse of(AdminUser admin) {
        return new AdminAccountListResponse(
                admin.getId(),
                admin.getEmail(),
                admin.getRole().name(),
                admin.getIsLocked(),
                admin.getLastLoginAt(),
                admin.getCreatedAt()
        );
    }
}
