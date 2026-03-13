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
        String cookingLevel,
        Boolean coachingEnabled,
        Integer completedCookingCount,
        Boolean isOnboarded,
        String status,
        String suspendedReason,
        Instant lastLoginAt,
        Instant createdAt,
        Instant updatedAt,
        ActivitySummary activitySummary
) {
    public record ActivitySummary(long coachingCount, long completionCount, int favoriteCount) {}

    public static AdminUserDetailResponse of(User user, long coachingCount,
                                              long completionCount, int favoriteCount) {
        return new AdminUserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getLoginType().name(),
                user.getCookingLevel().name(),
                user.getCoachingEnabled(),
                user.getCompletedCookingCount(),
                user.getIsOnboarded(),
                user.getStatus().name(),
                user.getSuspendedReason(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                new ActivitySummary(coachingCount, completionCount, favoriteCount)
        );
    }
}
