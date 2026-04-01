package com.picook.domain.admin.recipe.controller;

import com.picook.domain.admin.recipe.service.AdminRecipeService;
import com.picook.domain.admin.recipe.service.RecipeBulkUploadService;
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
        AdminRecipeController.class,
        AdminRecipeControllerTest.MockConfig.class
})
class AdminRecipeControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminRecipeService adminRecipeService() {
            return Mockito.mock(AdminRecipeService.class);
        }

        @Bean
        RecipeBulkUploadService recipeBulkUploadService() {
            return Mockito.mock(RecipeBulkUploadService.class);
        }
    }

    private static final String BASE_URL = "/api/admin/recipes";

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
        @DisplayName("DELETE /{id} — 토큰 없이 401")
        void 삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("PATCH /{id}/status — 일반 사용자 토큰 403")
        void 상태변경_사용자토큰_403() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/1/status")
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
        @DisplayName("POST — 빈 바디 → 400 (title 등 필수 필드 누락)")
        void 빈_바디_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST — title 빈값 → 400")
        void 제목_빈값_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"title":"","category":"한식","difficulty":"EASY",
                                     "cookingTimeMinutes":30,"ingredients":[],"steps":[]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(
                            org.hamcrest.Matchers.containsString("title")));
        }

        @Test
        @DisplayName("POST — cookingTimeMinutes null → 400")
        void 조리시간_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"title":"김치찌개","category":"한식","difficulty":"EASY",
                                     "ingredients":[],"steps":[]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST — ingredients null → 400")
        void 재료_null_400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"title":"김치찌개","category":"한식","difficulty":"EASY",
                                     "cookingTimeMinutes":30,"steps":[]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PATCH /status — status 빈값 → 400")
        void 상태_빈값_400() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"status":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
