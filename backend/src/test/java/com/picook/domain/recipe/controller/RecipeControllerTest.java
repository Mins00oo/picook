package com.picook.domain.recipe.controller;

import com.picook.domain.recipe.service.RecipeService;
import com.picook.domain.recipe.service.RecommendService;
import com.picook.domain.searchhistory.service.SearchHistoryService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        RecipeController.class,
        RecipeControllerTest.MockConfig.class
})
class RecipeControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        RecommendService recommendService() {
            return Mockito.mock(RecommendService.class);
        }

        @Bean
        RecipeService recipeService() {
            return Mockito.mock(RecipeService.class);
        }

        @Bean
        SearchHistoryService searchHistoryService() {
            return Mockito.mock(SearchHistoryService.class);
        }

        @Bean
        tools.jackson.databind.ObjectMapper recipeObjectMapper() {
            return Mockito.mock(tools.jackson.databind.ObjectMapper.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("POST /recommend — 토큰 없이 401")
        void 추천_토큰없이_401() throws Exception {
            mockMvc.perform(post("/api/v1/recipes/recommend")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /recommend — 만료 토큰 401")
        void 추천_만료토큰_401() throws Exception {
            mockMvc.perform(post("/api/v1/recipes/recommend")
                            .header("Authorization", "Bearer " + expiredToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /{id} — 토큰 없이 401")
        void 상세조회_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/recipes/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST /recommend — ingredientIds null → 400")
        void 재료ID_null_400() throws Exception {
            mockMvc.perform(post("/api/v1/recipes/recommend")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /recommend — ingredientIds 빈 배열 → 400")
        void 재료ID_빈배열_400() throws Exception {
            mockMvc.perform(post("/api/v1/recipes/recommend")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"ingredientIds":[]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
