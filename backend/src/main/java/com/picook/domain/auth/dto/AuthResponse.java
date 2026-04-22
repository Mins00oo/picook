package com.picook.domain.auth.dto;

import com.picook.domain.user.entity.User;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserInfo user
) {
    public record UserInfo(
            UUID id,
            String email,
            String displayName,
            String profileImageUrl,
            String loginType,
            String characterType,
            int completedCookingCount,
            int pointBalance
    ) {}

    public static AuthResponse of(String accessToken, String refreshToken, User user) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                new UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getDisplayName(),
                        user.getProfileImageUrl(),
                        user.getLoginType().name(),
                        user.getCharacterType(),
                        user.getCompletedCookingCount() == null ? 0 : user.getCompletedCookingCount(),
                        user.getPointBalance() == null ? 0 : user.getPointBalance()
                )
        );
    }
}
