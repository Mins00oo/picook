package com.picook.domain.coaching.controller;

import com.picook.domain.coaching.service.CoachingService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
        CoachingController.class,
        CoachingControllerTest.MockConfig.class
})
class CoachingControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        CoachingService coachingService() {
            return Mockito.mock(CoachingService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("POST /start — 토큰 없이 401")
        void 코칭시작_토큰없이_401() throws Exception {
            mockMvc.perform(post("/api/v1/coaching/start")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /start — 만료 토큰 401")
        void 코칭시작_만료토큰_401() throws Exception {
            mockMvc.perform(post("/api/v1/coaching/start")
                            .header("Authorization", "Bearer " + expiredToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("PATCH /{id}/complete — 토큰 없이 401")
        void 코칭완료_토큰없이_401() throws Exception {
            mockMvc.perform(patch("/api/v1/coaching/1/complete")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /{id}/photos — 토큰 없이 401")
        void 사진업로드_토큰없이_401() throws Exception {
            mockMvc.perform(multipart("/api/v1/coaching/1/photos")
                            .file(new MockMultipartFile("photos", "test.jpg", "image/jpeg", new byte[]{1})))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /photos/{photoId} — 토큰 없이 401")
        void 사진삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/coaching/photos/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("POST /start — mode 빈값 → 400")
        void 모드_빈값_400() throws Exception {
            mockMvc.perform(post("/api/v1/coaching/start")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"mode":"","recipeIds":[1]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("POST /start — mode null → 400")
        void 모드_null_400() throws Exception {
            mockMvc.perform(post("/api/v1/coaching/start")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"recipeIds":[1]}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PATCH /complete — actualSeconds null → 400")
        void 실제시간_null_400() throws Exception {
            mockMvc.perform(patch("/api/v1/coaching/1/complete")
                            .header("Authorization", "Bearer " + userToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
