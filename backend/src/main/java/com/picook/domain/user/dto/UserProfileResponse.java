package com.picook.domain.user.dto;

import com.picook.domain.user.entity.User;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String displayName,
        String profileImageUrl,
        String loginType,
        String characterType,
        int completedCookingCount,
        int pointBalance,
        RankInfo rank
) {
    public static UserProfileResponse of(User user) {
        int count = user.getCompletedCookingCount() == null ? 0 : user.getCompletedCookingCount();
        int points = user.getPointBalance() == null ? 0 : user.getPointBalance();
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getLoginType().name(),
                user.getCharacterType(),
                count,
                points,
                RankInfo.of(count)
        );
    }
}
