package com.picook.domain.admin.account.controller;

import com.picook.domain.admin.account.dto.AdminAccountCreateRequest;
import com.picook.domain.admin.account.dto.AdminAccountListResponse;
import com.picook.domain.admin.account.dto.AdminAccountUpdateRequest;
import com.picook.domain.admin.account.service.AdminAccountService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminAccountController.class,
        AdminAccountControllerTest.MockConfig.class
})
class AdminAccountControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminAccountService adminAccountService() {
            return Mockito.mock(AdminAccountService.class);
        }
    }

    @Autowired
    AdminAccountService adminAccountService;

    private static final String BASE_URL = "/api/admin/accounts";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminAccountService);
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이 요청하면 401")
        void 토큰_없이_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("만료된 토큰으로 요청하면 401")
        void 만료된_토큰으로_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("일반 사용자 토큰으로 요청하면 403")
        void 일반_사용자_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("CONTENT_ADMIN 토큰으로 SUPER_ADMIN 전용 API 요청하면 403")
        void CONTENT_ADMIN_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("관리자 계정 목록 조회 성공")
        void 계정_목록_조회_성공() throws Exception {
            var response = List.of(
                    new AdminAccountListResponse(1, "admin@picook.co.kr", "SUPER_ADMIN",
                            false, Instant.now(), Instant.now())
            );
            when(adminAccountService.getAccounts()).thenReturn(response);

            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data[0].email").value("admin@picook.co.kr"))
                    .andExpect(jsonPath("$.data[0].role").value("SUPER_ADMIN"));
        }

        @Test
        @DisplayName("관리자 계정 생성 성공")
        void 계정_생성_성공() throws Exception {
            var response = new AdminAccountListResponse(2, "new@picook.co.kr", "CONTENT_ADMIN",
                    false, null, Instant.now());
            when(adminAccountService.createAccount(any(AdminAccountCreateRequest.class)))
                    .thenReturn(response);

            var request = new AdminAccountCreateRequest("new@picook.co.kr", "password123", "CONTENT_ADMIN");

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.email").value("new@picook.co.kr"))
                    .andExpect(jsonPath("$.data.role").value("CONTENT_ADMIN"));
        }

        @Test
        @DisplayName("관리자 계정 수정 성공")
        void 계정_수정_성공() throws Exception {
            var response = new AdminAccountListResponse(2, "admin@picook.co.kr", "SUPER_ADMIN",
                    false, Instant.now(), Instant.now());
            when(adminAccountService.updateAccount(eq(2), any(AdminAccountUpdateRequest.class)))
                    .thenReturn(response);

            var request = new AdminAccountUpdateRequest("SUPER_ADMIN");

            mockMvc.perform(put(BASE_URL + "/2")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"));
        }

        @Test
        @DisplayName("관리자 계정 삭제 성공")
        void 계정_삭제_성공() throws Exception {
            doNothing().when(adminAccountService).deleteAccount(2, 1);

            mockMvc.perform(delete(BASE_URL + "/2")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .header("X-Admin-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("관리자 계정 잠금 해제 성공")
        void 계정_잠금_해제_성공() throws Exception {
            var response = new AdminAccountListResponse(2, "admin@picook.co.kr", "CONTENT_ADMIN",
                    false, Instant.now(), Instant.now());
            when(adminAccountService.unlockAccount(2)).thenReturn(response);

            mockMvc.perform(patch(BASE_URL + "/2/unlock")
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.isLocked").value(false));
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST — 빈 바디 → 400")
        void 빈_바디_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST — email 빈값 → 400")
        void 이메일_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"","password":"pass123","role":"CONTENT_ADMIN"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(org.hamcrest.Matchers.containsString("email")));
        }

        @Test
        @DisplayName("POST — password null → 400")
        void 비밀번호_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"a@b.com","role":"CONTENT_ADMIN"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST — role 공백만 → 400")
        void 역할_공백_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"a@b.com","password":"pass123","role":"   "}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PUT — role 빈값 → 400")
        void 수정_역할_빈값_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/2")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"role":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
