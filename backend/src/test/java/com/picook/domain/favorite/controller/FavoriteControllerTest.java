package com.picook.domain.favorite.controller;

import com.picook.domain.favorite.service.FavoriteService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        FavoriteController.class,
        FavoriteControllerTest.MockConfig.class
})
class FavoriteControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        FavoriteService favoriteService() {
            return Mockito.mock(FavoriteService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("GET /favorites — 토큰 없이 401")
        void 목록_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/favorites"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /favorites — 만료 토큰 401")
        void 목록_만료토큰_401() throws Exception {
            mockMvc.perform(get("/api/v1/favorites")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /favorites — 토큰 없이 401")
        void 추가_토큰없이_401() throws Exception {
            mockMvc.perform(post("/api/v1/favorites"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /favorites/{id} — 토큰 없이 401")
        void 삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/favorites/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST — recipeId null → 400")
        void 레시피ID_null_400() throws Exception {
            mockMvc.perform(post("/api/v1/favorites")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.error.message").value(
                            org.hamcrest.Matchers.containsString("recipeId")));
        }
    }
}
