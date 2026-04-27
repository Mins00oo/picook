package com.picook.domain.user.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void newUser_shouldHaveDefaults() {
        User user = new User(LoginType.KAKAO);

        assertThat(user.getLoginType()).isEqualTo(LoginType.KAKAO);
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getCompletedCookingCount()).isZero();
        assertThat(user.getPointBalance()).isZero();
        assertThat(user.getCharacterType()).isNull();
    }

    @Test
    void setters_shouldWorkCorrectly() {
        User user = new User(LoginType.APPLE);
        user.setEmail("test@example.com");
        user.setDisplayName("Test User");
        user.setAppleId("apple-sub-123");
        user.setKakaoId("kakao-123");
        user.setCharacterType("MIN");

        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getDisplayName()).isEqualTo("Test User");
        assertThat(user.getAppleId()).isEqualTo("apple-sub-123");
        assertThat(user.getKakaoId()).isEqualTo("kakao-123");
        assertThat(user.getCharacterType()).isEqualTo("MIN");
    }
}
