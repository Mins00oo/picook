package com.picook.domain.user.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void newUser_shouldHaveDefaults() {
        User user = new User(LoginType.KAKAO);

        assertThat(user.getLoginType()).isEqualTo(LoginType.KAKAO);
        assertThat(user.getCookingLevel()).isEqualTo(CookingLevel.BEGINNER);
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getCoachingEnabled()).isTrue();
        assertThat(user.getCoachingVoiceSpeed()).isEqualByComparingTo(new BigDecimal("1.0"));
        assertThat(user.getCompletedCookingCount()).isZero();
        assertThat(user.getIsOnboarded()).isFalse();
    }

    @Test
    void setters_shouldWorkCorrectly() {
        User user = new User(LoginType.APPLE);
        user.setEmail("test@example.com");
        user.setDisplayName("Test User");
        user.setAppleId("apple-sub-123");
        user.setKakaoId("kakao-123");

        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getDisplayName()).isEqualTo("Test User");
        assertThat(user.getAppleId()).isEqualTo("apple-sub-123");
        assertThat(user.getKakaoId()).isEqualTo("kakao-123");
    }
}
