package com.picook.domain.auth.service;

import com.picook.config.JwtProvider;
import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    public AuthService(JwtProvider jwtProvider, UserRepository userRepository) {
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException("INVALID_TOKEN", "Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }

        String subject = jwtProvider.getSubject(refreshToken);
        UUID userId = UUID.fromString(subject);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        String newAccessToken = jwtProvider.generateAccessToken(user.getId().toString(), Map.of());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getId().toString());

        return AuthResponse.of(newAccessToken, newRefreshToken, user);
    }

    public AuthResponse createAuthResponse(User user) {
        String accessToken = jwtProvider.generateAccessToken(user.getId().toString(), Map.of());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId().toString());
        return AuthResponse.of(accessToken, refreshToken, user);
    }
}
