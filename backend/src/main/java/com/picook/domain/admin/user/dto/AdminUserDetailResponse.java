package com.picook.domain.admin.user.dto;

import com.picook.domain.user.entity.User;

import java.time.Instant;
import java.util.UUID;

public record AdminUserDetailResponse(
        UUID id,
        String email,
        String displayName,
        String profileImageUrl,
        String loginType,
        String characterType,
        Integer completedCookingCount,
        Integer pointBalance,
        String status,
        String suspendedReason,
        Instant lastLoginAt,
        Instant createdAt,
        Instant updatedAt,
        ActivitySummary activitySummary
) {
    public record ActivitySummary(int favoriteCount) {}

    public static AdminUserDetailResponse of(User user, int favoriteCount) {
        return new AdminUserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getLoginType().name(),
                user.getCharacterType(),
                user.getCompletedCookingCount(),
                user.getPointBalance(),
                user.getStatus().name(),
                user.getSuspendedReason(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                new ActivitySummary(favoriteCount)
        );
    }
}
