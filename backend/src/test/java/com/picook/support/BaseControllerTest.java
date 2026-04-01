package com.picook.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.picook.config.*;
import com.picook.global.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import java.util.Map;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@TestPropertySource(properties = {
        "jwt.secret=test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890",
        "jwt.access-expiration=3600000",
        "jwt.refresh-expiration=2592000000",
        "security.trusted-proxies=127.0.0.1"
})
public abstract class BaseControllerTest {

    protected static final String TEST_SECRET =
            "test-secret-key-minimum-256-bit-for-hmac-sha-algorithm-here-1234567890";

    @Configuration
    @EnableWebMvc
    @Import({SecurityConfig.class, CorsConfig.class,
            JwtAuthenticationFilter.class, JwtProvider.class,
            ClientIpResolver.class, RequestLoggingFilter.class, RateLimitFilter.class,
            GlobalExceptionHandler.class})
    public static class SecurityTestConfig {
    }

    @Autowired
    protected WebApplicationContext wac;

    @Autowired
    protected JwtProvider jwtProvider;

    protected MockMvc mockMvc;

    protected ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(springSecurity())
                .build();
    }

    protected String superAdminToken() {
        return jwtProvider.generateAccessToken("1", Map.of("role", "SUPER_ADMIN"));
    }

    protected String contentAdminToken() {
        return jwtProvider.generateAccessToken("2", Map.of("role", "CONTENT_ADMIN"));
    }

    protected String viewerToken() {
        return jwtProvider.generateAccessToken("3", Map.of("role", "VIEWER"));
    }

    protected String userToken() {
        return jwtProvider.generateAccessToken(UUID.randomUUID().toString(), Map.of());
    }

    protected String userTokenWithId(UUID userId) {
        return jwtProvider.generateAccessToken(userId.toString(), Map.of());
    }

    protected String expiredToken() {
        JwtProvider expired = new JwtProvider(TEST_SECRET, -1000L, -1000L);
        return expired.generateAccessToken("1", Map.of("role", "SUPER_ADMIN"));
    }
}
