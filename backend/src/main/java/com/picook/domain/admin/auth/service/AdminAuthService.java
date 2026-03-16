package com.picook.domain.admin.auth.service;

import com.picook.config.JwtProvider;
import com.picook.domain.admin.auth.dto.AdminAuthResponse;
import com.picook.domain.admin.auth.dto.AdminMeResponse;
import com.picook.domain.admin.auth.entity.AdminUser;
import com.picook.domain.admin.auth.repository.AdminUserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthService(AdminUserRepository adminUserRepository,
                            JwtProvider jwtProvider,
                            PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminAuthResponse login(String email, String password) {
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("ADMIN_NOT_FOUND", "Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (admin.isCurrentlyLocked()) {
            throw new BusinessException("ACCOUNT_LOCKED", "Account is locked. Try again later.", HttpStatus.LOCKED);
        }

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            admin.incrementFailedLogin();
            adminUserRepository.save(admin);
            throw new BusinessException("INVALID_CREDENTIALS", "Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        admin.resetFailedLogin();
        admin.setLastLoginAt(Instant.now());
        adminUserRepository.save(admin);

        String accessToken = jwtProvider.generateAccessToken(
                admin.getId().toString(),
                Map.of("role", admin.getRole().name())
        );
        String refreshToken = jwtProvider.generateAdminRefreshToken(admin.getId().toString());

        return AdminAuthResponse.of(accessToken, refreshToken, admin);
    }

    public AdminAuthResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException("INVALID_TOKEN", "유효하지 않은 리프레시 토큰입니다", HttpStatus.UNAUTHORIZED);
        }

        String adminId = jwtProvider.getSubject(refreshToken);
        AdminUser admin = adminUserRepository.findById(Integer.parseInt(adminId))
                .orElseThrow(() -> new BusinessException("ADMIN_NOT_FOUND", "관리자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        String newAccessToken = jwtProvider.generateAccessToken(
                admin.getId().toString(),
                Map.of("role", admin.getRole().name())
        );
        String newRefreshToken = jwtProvider.generateAdminRefreshToken(admin.getId().toString());

        return AdminAuthResponse.of(newAccessToken, newRefreshToken, admin);
    }

    public AdminMeResponse getMe(Integer adminId) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("ADMIN_NOT_FOUND", "관리자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        return AdminMeResponse.of(admin);
    }

    @Transactional
    public void changePassword(Integer adminId, String currentPassword, String newPassword) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("ADMIN_NOT_FOUND", "관리자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new BusinessException("INVALID_PASSWORD", "현재 비밀번호가 일치하지 않습니다", HttpStatus.BAD_REQUEST);
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(admin);
    }
}
