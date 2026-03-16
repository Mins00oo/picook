package com.picook.domain.admin.auth.dto;

import com.picook.domain.admin.auth.entity.AdminUser;

import java.time.Instant;

public record AdminMeResponse(
        Integer id,
        String email,
        String role,
        Instant lastLoginAt,
        Instant createdAt
) {
    public static AdminMeResponse of(AdminUser admin) {
        return new AdminMeResponse(
                admin.getId(),
                admin.getEmail(),
                admin.getRole().name(),
                admin.getLastLoginAt(),
                admin.getCreatedAt()
        );
    }
}
