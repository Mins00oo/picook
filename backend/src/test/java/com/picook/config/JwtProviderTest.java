package com.picook.config;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtProviderTest {

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(
                "test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890",
                3600000L,   // 1h
                2592000000L // 30d
        );
    }

    @Test
    void generateAccessToken_shouldCreateValidToken() {
        String token = jwtProvider.generateAccessToken("user-123", Map.of("role", "SUPER_ADMIN"));

        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getSubject(token)).isEqualTo("user-123");

        Claims claims = jwtProvider.getClaims(token);
        assertThat(claims.get("role")).isEqualTo("SUPER_ADMIN");
    }

    @Test
    void generateRefreshToken_shouldCreateValidToken() {
        String token = jwtProvider.generateRefreshToken("user-123");

        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getSubject(token)).isEqualTo("user-123");
    }

    @Test
    void generateAdminRefreshToken_shouldCreateValidToken() {
        String token = jwtProvider.generateAdminRefreshToken("admin-1");

        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getSubject(token)).isEqualTo("admin-1");
    }

    @Test
    void validateToken_shouldReturnFalseForInvalidToken() {
        assertThat(jwtProvider.validateToken("invalid.token.here")).isFalse();
        assertThat(jwtProvider.validateToken("")).isFalse();
        assertThat(jwtProvider.validateToken(null)).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForExpiredToken() {
        JwtProvider shortLivedProvider = new JwtProvider(
                "test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890",
                -1000L, // already expired
                -1000L
        );
        String token = shortLivedProvider.generateAccessToken("user-123", Map.of());

        assertThat(jwtProvider.validateToken(token)).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForTokenSignedWithDifferentKey() {
        JwtProvider otherProvider = new JwtProvider(
                "different-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-999",
                3600000L,
                2592000000L
        );
        String token = otherProvider.generateAccessToken("user-123", Map.of());

        assertThat(jwtProvider.validateToken(token)).isFalse();
    }
}
