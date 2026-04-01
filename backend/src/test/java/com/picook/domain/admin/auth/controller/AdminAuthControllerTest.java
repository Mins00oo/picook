package com.picook.domain.admin.auth.controller;

import com.picook.domain.admin.auth.service.AdminAuthService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminAuthController.class,
        AdminAuthControllerTest.MockConfig.class
})
class AdminAuthControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminAuthService adminAuthService() {
            return Mockito.mock(AdminAuthService.class);
        }
    }

    private static final String BASE_URL = "/api/admin/auth";

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST /login — 빈 바디 → 400")
        void 로그인_빈바디_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /login — email 빈값 → 400")
        void 로그인_이메일_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"","password":"pass123"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /login — email 잘못된 형식 → 400")
        void 로그인_이메일_형식오류_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"not-an-email","password":"pass123"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(
                            org.hamcrest.Matchers.containsString("email")));
        }

        @Test
        @DisplayName("POST /login — password null → 400")
        void 로그인_비밀번호_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"admin@picook.co.kr"}
                                    """))
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
        @DisplayName("PUT /password — currentPassword 빈값 → 400")
        void 비밀번호변경_현재비번_빈값_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/password")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"currentPassword":"","newPassword":"newPass123"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PUT /password — newPassword null → 400")
        void 비밀번호변경_새비번_null_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/password")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"currentPassword":"oldPass123"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
