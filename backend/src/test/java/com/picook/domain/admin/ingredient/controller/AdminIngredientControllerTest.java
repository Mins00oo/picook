package com.picook.domain.admin.ingredient.controller;

import com.picook.domain.admin.ingredient.service.AdminIngredientService;
import com.picook.domain.admin.ingredient.service.IngredientBulkUploadService;
import com.picook.domain.admin.ingredient.service.IngredientExportService;
import com.picook.domain.admin.ingredient.service.IngredientStatsService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminIngredientController.class,
        AdminIngredientControllerTest.MockConfig.class
})
class AdminIngredientControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminIngredientService adminIngredientService() {
            return Mockito.mock(AdminIngredientService.class);
        }

        @Bean
        IngredientBulkUploadService ingredientBulkUploadService() {
            return Mockito.mock(IngredientBulkUploadService.class);
        }

        @Bean
        IngredientExportService ingredientExportService() {
            return Mockito.mock(IngredientExportService.class);
        }

        @Bean
        IngredientStatsService ingredientStatsService() {
            return Mockito.mock(IngredientStatsService.class);
        }
    }

    private static final String BASE_URL = "/api/admin/ingredients";

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
            mockMvc.perform(post(BASE_URL))
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
        @DisplayName("GET /bulk-template — 토큰 없이 401")
        void 템플릿_토큰없이_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/bulk-template"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST — name 빈값 → 400")
        void 재료명_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"","categoryId":1}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(
                            org.hamcrest.Matchers.containsString("name")));
        }

        @Test
        @DisplayName("POST — categoryId null → 400")
        void 카테고리ID_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"감자"}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(
                            org.hamcrest.Matchers.containsString("categoryId")));
        }

        @Test
        @DisplayName("POST — 빈 바디 → 400")
        void 빈_바디_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
