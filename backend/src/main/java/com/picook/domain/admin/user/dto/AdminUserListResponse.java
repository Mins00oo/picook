package com.picook.domain.admin.user.dto;

import com.picook.domain.user.entity.User;

import java.time.Instant;
import java.util.UUID;

public record AdminUserListResponse(
        UUID id,
        String email,
        String displayName,
        String loginType,
        String status,
        Integer completedCookingCount,
        Instant lastLoginAt,
        Instant createdAt
) {
    public static AdminUserListResponse of(User user) {
        return new AdminUserListResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getLoginType().name(),
                user.getStatus().name(),
                user.getCompletedCookingCount(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
