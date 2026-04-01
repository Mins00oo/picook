package com.picook.domain.auth.controller;

import com.picook.domain.auth.service.AppleAuthService;
import com.picook.domain.auth.service.AuthService;
import com.picook.domain.auth.service.KakaoAuthService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AuthController.class,
        AuthControllerTest.MockConfig.class
})
class AuthControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AuthService authService() {
            return Mockito.mock(AuthService.class);
        }

        @Bean
        KakaoAuthService kakaoAuthService() {
            return Mockito.mock(KakaoAuthService.class);
        }

        @Bean
        AppleAuthService appleAuthService() {
            return Mockito.mock(AppleAuthService.class);
        }
    }

    private static final String BASE_URL = "/api/auth";

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST /kakao — accessToken 빈값 → 400")
        void 카카오_토큰_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/kakao")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"accessToken":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /kakao — accessToken null → 400")
        void 카카오_토큰_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/kakao")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /apple — identityToken 빈값 → 400")
        void 애플_토큰_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/apple")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"identityToken":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /apple — 빈 바디 → 400")
        void 애플_빈바디_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/apple")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /refresh — refreshToken 빈값 → 400")
        void 리프레시_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"refreshToken":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /refresh — refreshToken null → 400")
        void 리프레시_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
