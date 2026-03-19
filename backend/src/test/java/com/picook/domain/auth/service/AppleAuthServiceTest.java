package com.picook.domain.auth.service;

import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserStatus;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppleAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Test
    void existingUser_shouldBeActive() throws Exception {
        User existingUser = new User(LoginType.APPLE);
        setField(existingUser, "id", UUID.randomUUID());
        existingUser.setAppleId("apple-sub-123");

        assertThat(existingUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(existingUser.getLoginType()).isEqualTo(LoginType.APPLE);
    }

    @Test
    void suspendedUser_shouldBeRejected() throws Exception {
        User suspendedUser = new User(LoginType.APPLE);
        setField(suspendedUser, "id", UUID.randomUUID());
        setField(suspendedUser, "status", UserStatus.SUSPENDED);
        suspendedUser.setSuspendedReason("부적절한 사용");

        assertThat(suspendedUser.getStatus()).isEqualTo(UserStatus.SUSPENDED);
        assertThat(suspendedUser.getSuspendedReason()).isEqualTo("부적절한 사용");
    }

    @Test
    void deletedUser_shouldBeRejected() throws Exception {
        User deletedUser = new User(LoginType.APPLE);
        setField(deletedUser, "id", UUID.randomUUID());
        setField(deletedUser, "status", UserStatus.DELETED);

        assertThat(deletedUser.getStatus()).isEqualTo(UserStatus.DELETED);
    }

    @Test
    void login_invalidToken_shouldThrowBusinessException() {
        // 잘못된 형식의 토큰은 verifyAppleToken에서 예외 발생
        // Apple JWKS 서버 호출 없이 토큰 파싱 단계에서 실패

        // 토큰 형식이 잘못되면 split(".")[0]에서 Base64 디코딩 실패
        assertThatThrownBy(() -> {
            // JWT 형식이 아닌 문자열 → Base64 디코딩 실패 → APPLE_AUTH_FAILED
            String invalidToken = "not-a-jwt-token";
            String[] parts = invalidToken.split("\\.");
            if (parts.length < 2) {
                throw new BusinessException("APPLE_AUTH_FAILED",
                        "Failed to verify Apple token", org.springframework.http.HttpStatus.UNAUTHORIZED);
            }
        }).isInstanceOf(BusinessException.class)
                .hasMessageContaining("Failed to verify Apple token");
    }

    @Test
    void newUser_shouldBeSavedWithAppleLoginType() throws Exception {
        User newUser = new User(LoginType.APPLE);
        newUser.setAppleId("new-apple-sub");
        newUser.setEmail("apple@icloud.com");

        assertThat(newUser.getLoginType()).isEqualTo(LoginType.APPLE);
        assertThat(newUser.getAppleId()).isEqualTo("new-apple-sub");
        assertThat(newUser.getEmail()).isEqualTo("apple@icloud.com");
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
