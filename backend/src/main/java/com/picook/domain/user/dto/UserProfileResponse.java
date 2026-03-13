package com.picook.domain.user.dto;

import com.picook.domain.user.entity.User;
import java.math.BigDecimal;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String displayName,
        String profileImageUrl,
        String loginType,
        String cookingLevel,
        boolean coachingEnabled,
        BigDecimal coachingVoiceSpeed,
        int completedCookingCount,
        boolean isOnboarded,
        RankInfo rank
) {
    public static UserProfileResponse of(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getLoginType().name(),
                user.getCookingLevel().name(),
                Boolean.TRUE.equals(user.getCoachingEnabled()),
                user.getCoachingVoiceSpeed(),
                user.getCompletedCookingCount(),
                Boolean.TRUE.equals(user.getIsOnboarded()),
                RankInfo.of(user.getCompletedCookingCount())
        );
    }
}
