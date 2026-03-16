package com.picook.domain.admin.auth.dto;

import com.picook.domain.admin.auth.entity.AdminUser;

public record AdminAuthResponse(
        String accessToken,
        String refreshToken,
        AdminInfo admin
) {
    public record AdminInfo(
            Integer id,
            String email,
            String role
    ) {}

    public static AdminAuthResponse of(String accessToken, String refreshToken, AdminUser admin) {
        return new AdminAuthResponse(
                accessToken,
                refreshToken,
                new AdminInfo(admin.getId(), admin.getEmail(), admin.getRole().name())
        );
    }
}
