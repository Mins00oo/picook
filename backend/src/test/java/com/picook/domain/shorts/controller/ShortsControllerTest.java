package com.picook.domain.shorts.controller;

import com.picook.domain.shorts.service.ShortsFavoriteService;
import com.picook.domain.shorts.service.ShortsConvertService;
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
        ShortsController.class,
        ShortsControllerTest.MockConfig.class
})
class ShortsControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        ShortsConvertService shortsConvertService() {
            return Mockito.mock(ShortsConvertService.class);
        }

        @Bean
        ShortsFavoriteService shortsFavoriteService() {
            return Mockito.mock(ShortsFavoriteService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("POST /convert — 토큰 없이 401")
        void 변환_토큰없이_401() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/convert")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /convert — 만료 토큰 401")
        void 변환_만료토큰_401() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/convert")
                            .header("Authorization", "Bearer " + expiredToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /recent — 토큰 없이 401")
        void 최근목록_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/shorts/recent"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /{cacheId} — 토큰 없이 401")
        void 캐시상세_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/shorts/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /history/{id} — 토큰 없이 401")
        void 기록삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/shorts/history/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /history — 토큰 없이 401")
        void 기록전체삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/shorts/history"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /favorites — 토큰 없이 401")
        void 즐겨찾기_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/shorts/favorites"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /favorites — 토큰 없이 401")
        void 즐겨찾기추가_토큰없이_401() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/favorites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /favorites/{id} — 토큰 없이 401")
        void 즐겨찾기삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/shorts/favorites/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST /convert — youtubeUrl 빈값 → 400")
        void URL_빈값_400() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/convert")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"youtubeUrl":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /convert — youtubeUrl null → 400")
        void URL_null_400() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/convert")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /favorites — shortsCacheId null → 400")
        void 즐겨찾기_캐시ID_null_400() throws Exception {
            mockMvc.perform(post("/api/v1/shorts/favorites")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
