package com.picook.domain.auth.service;

import com.picook.config.JwtProvider;
import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private JwtProvider jwtProvider;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(
                "test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890",
                3600000L,
                2592000000L
        );
        authService = new AuthService(jwtProvider, userRepository);
    }

    @Test
    void refreshToken_shouldReturnNewTokens() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = new User(LoginType.KAKAO);
        setField(user, "id", userId);
        user.setEmail("test@test.com");

        String refreshToken = jwtProvider.generateRefreshToken(userId.toString());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        AuthResponse response = authService.refreshToken(refreshToken);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().id()).isEqualTo(userId);
    }

    @Test
    void refreshToken_shouldThrowForInvalidToken() {
        assertThatThrownBy(() -> authService.refreshToken("invalid-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid or expired refresh token");
    }

    @Test
    void refreshToken_shouldThrowForNonExistentUser() {
        UUID userId = UUID.randomUUID();
        String refreshToken = jwtProvider.generateRefreshToken(userId.toString());
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void createAuthResponse_shouldReturnTokensAndUserInfo() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = new User(LoginType.APPLE);
        setField(user, "id", userId);
        user.setEmail("apple@test.com");
        user.setDisplayName("Apple User");

        AuthResponse response = authService.createAuthResponse(user);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().loginType()).isEqualTo("APPLE");
        assertThat(response.user().displayName()).isEqualTo("Apple User");
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
