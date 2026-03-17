package com.picook.domain.admin.auth.service;

import com.picook.config.JwtProvider;
import com.picook.domain.admin.auth.dto.AdminAuthResponse;
import com.picook.domain.admin.auth.entity.AdminRole;
import com.picook.domain.admin.auth.entity.AdminUser;
import com.picook.domain.admin.auth.repository.AdminUserRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    private JwtProvider jwtProvider;
    private PasswordEncoder passwordEncoder;
    private AdminAuthService adminAuthService;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(
                "test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890",
                3600000L,
                2592000000L
        );
        passwordEncoder = new BCryptPasswordEncoder();
        adminAuthService = new AdminAuthService(adminUserRepository, jwtProvider, passwordEncoder);
    }

    @Test
    void login_shouldReturnTokensOnSuccess() throws Exception {
        String rawPassword = "password123";
        AdminUser admin = new AdminUser("admin@test.com", passwordEncoder.encode(rawPassword), AdminRole.SUPER_ADMIN);
        setField(admin, "id", 1);

        when(adminUserRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(adminUserRepository.save(any())).thenReturn(admin);

        AdminAuthResponse response = adminAuthService.login("admin@test.com", rawPassword);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.admin().email()).isEqualTo("admin@test.com");
        assertThat(response.admin().role()).isEqualTo("SUPER_ADMIN");
    }

    @Test
    void login_shouldThrowForWrongPassword() throws Exception {
        AdminUser admin = new AdminUser("admin@test.com", passwordEncoder.encode("correct"), AdminRole.CONTENT_ADMIN);
        setField(admin, "id", 1);

        when(adminUserRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(adminUserRepository.save(any())).thenReturn(admin);

        assertThatThrownBy(() -> adminAuthService.login("admin@test.com", "wrong"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_shouldThrowForNonExistentAdmin() {
        when(adminUserRepository.findByEmail("none@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminAuthService.login("none@test.com", "pass"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_shouldLockAfterFiveFailedAttempts() throws Exception {
        String encoded = passwordEncoder.encode("correct");
        AdminUser admin = new AdminUser("admin@test.com", encoded, AdminRole.CONTENT_ADMIN);
        setField(admin, "id", 1);

        when(adminUserRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(adminUserRepository.save(any())).thenReturn(admin);

        for (int i = 0; i < 5; i++) {
            try {
                adminAuthService.login("admin@test.com", "wrong");
            } catch (BusinessException ignored) {}
        }

        assertThatThrownBy(() -> adminAuthService.login("admin@test.com", "correct"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Account is locked");
    }

    @Test
    void login_shouldResetFailedCountOnSuccess() throws Exception {
        String rawPassword = "correct";
        AdminUser admin = new AdminUser("admin@test.com", passwordEncoder.encode(rawPassword), AdminRole.CONTENT_ADMIN);
        setField(admin, "id", 1);

        when(adminUserRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(adminUserRepository.save(any())).thenReturn(admin);

        // Fail 3 times
        for (int i = 0; i < 3; i++) {
            try {
                adminAuthService.login("admin@test.com", "wrong");
            } catch (BusinessException ignored) {}
        }

        // Succeed
        AdminAuthResponse response = adminAuthService.login("admin@test.com", rawPassword);
        assertThat(response).isNotNull();
        assertThat(admin.getFailedLoginCount()).isZero();
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
