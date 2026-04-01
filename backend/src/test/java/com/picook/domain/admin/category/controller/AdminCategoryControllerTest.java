package com.picook.domain.admin.category.controller;

import com.picook.domain.admin.category.service.AdminCategoryService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminCategoryController.class,
        AdminCategoryControllerTest.MockConfig.class
})
class AdminCategoryControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminCategoryService adminCategoryService() {
            return Mockito.mock(AdminCategoryService.class);
        }
    }

    private static final String BASE_URL = "/api/admin/categories";

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("GET / — 토큰 없이 401")
        void 목록_토큰없이_401() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET / — 만료 토큰 401")
        void 목록_만료토큰_401() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET / — 일반 사용자 토큰 403")
        void 목록_사용자토큰_403() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST / — 토큰 없이 401")
        void 생성_토큰없이_401() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /{id} — 일반 사용자 토큰 403")
        void 삭제_사용자토큰_403() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1")
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("PUT /reorder — 토큰 없이 401")
        void 순서변경_토큰없이_401() throws Exception {
            mockMvc.perform(put(BASE_URL + "/reorder")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST — name 빈값 → 400")
        void 카테고리명_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST — name 공백만 → 400")
        void 카테고리명_공백_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"   "}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PUT /reorder — orderedIds 빈 배열 → 400")
        void 순서변경_빈배열_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/reorder")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"orderedIds":[]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PUT /reorder — orderedIds null → 400")
        void 순서변경_null_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/reorder")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
