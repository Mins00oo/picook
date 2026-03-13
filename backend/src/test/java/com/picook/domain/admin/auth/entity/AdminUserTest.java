package com.picook.domain.admin.auth.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AdminUserTest {

    @Test
    void newAdminUser_shouldHaveCorrectDefaults() {
        AdminUser admin = new AdminUser("admin@test.com", "hashed", AdminRole.CONTENT_ADMIN);

        assertThat(admin.getEmail()).isEqualTo("admin@test.com");
        assertThat(admin.getRole()).isEqualTo(AdminRole.CONTENT_ADMIN);
        assertThat(admin.getIsLocked()).isFalse();
        assertThat(admin.getFailedLoginCount()).isZero();
    }

    @Test
    void isCurrentlyLocked_shouldReturnFalseWhenNotLocked() {
        AdminUser admin = new AdminUser("admin@test.com", "hashed", AdminRole.CONTENT_ADMIN);

        assertThat(admin.isCurrentlyLocked()).isFalse();
    }

    @Test
    void incrementFailedLogin_shouldLockAfterFiveAttempts() {
        AdminUser admin = new AdminUser("admin@test.com", "hashed", AdminRole.CONTENT_ADMIN);

        for (int i = 0; i < 5; i++) {
            admin.incrementFailedLogin();
        }

        assertThat(admin.getIsLocked()).isTrue();
        assertThat(admin.getLockedUntil()).isNotNull();
        assertThat(admin.isCurrentlyLocked()).isTrue();
    }

    @Test
    void incrementFailedLogin_shouldNotLockBeforeFiveAttempts() {
        AdminUser admin = new AdminUser("admin@test.com", "hashed", AdminRole.CONTENT_ADMIN);

        for (int i = 0; i < 4; i++) {
            admin.incrementFailedLogin();
        }

        assertThat(admin.getIsLocked()).isFalse();
    }

    @Test
    void resetFailedLogin_shouldClearLock() {
        AdminUser admin = new AdminUser("admin@test.com", "hashed", AdminRole.CONTENT_ADMIN);

        for (int i = 0; i < 5; i++) {
            admin.incrementFailedLogin();
        }
        assertThat(admin.isCurrentlyLocked()).isTrue();

        admin.resetFailedLogin();

        assertThat(admin.isCurrentlyLocked()).isFalse();
        assertThat(admin.getFailedLoginCount()).isZero();
        assertThat(admin.getIsLocked()).isFalse();
    }
}
