package com.picook.domain.admin.feedback.controller;

import com.picook.domain.admin.feedback.dto.*;
import com.picook.domain.admin.feedback.service.AdminFeedbackService;
import com.picook.global.util.PageResponse;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
        AdminFeedbackController.class,
        AdminFeedbackControllerTest.MockConfig.class
})
class AdminFeedbackControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminFeedbackService adminFeedbackService() {
            return Mockito.mock(AdminFeedbackService.class);
        }
    }

    @Autowired
    AdminFeedbackService adminFeedbackService;

    private static final String BASE_URL = "/api/admin/feedback";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminFeedbackService);
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
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("피드백 목록 조회 성공")
        void 목록_조회_성공() throws Exception {
            var item = new AdminFeedbackListResponse(
                    1, UUID.randomUUID(), "테스터", 10, "김치찌개",
                    "GOOD", "pending", Instant.now());
            var page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
            when(adminFeedbackService.getFeedbackList(any(), any(), any(), eq(0), eq(10)))
                    .thenReturn(PageResponse.from(page));

            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].recipeTitle").value("김치찌개"));
        }

        @Test
        @DisplayName("피드백 상세 조회 성공")
        void 상세_조회_성공() throws Exception {
            var detail = new AdminFeedbackDetailResponse(
                    1, UUID.randomUUID(), "테스터", "user@test.com",
                    10, "김치찌개", "GOOD", "맛있었어요",
                    "pending", null, Instant.now(), Instant.now());
            when(adminFeedbackService.getFeedback(1)).thenReturn(detail);

            mockMvc.perform(get(BASE_URL + "/1")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.comment").value("맛있었어요"));
        }

        @Test
        @DisplayName("피드백 상태 변경 성공")
        void 상태_변경_성공() throws Exception {
            doNothing().when(adminFeedbackService).changeStatus(eq(1), any(AdminFeedbackStatusRequest.class));

            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new AdminFeedbackStatusRequest("reviewed"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("피드백 메모 수정 성공")
        void 메모_수정_성공() throws Exception {
            doNothing().when(adminFeedbackService).updateNote(eq(1), any(AdminFeedbackNoteRequest.class));

            mockMvc.perform(put(BASE_URL + "/1/note")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new AdminFeedbackNoteRequest("확인 완료"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("피드백 요약 통계 조회 성공")
        void 요약_조회_성공() throws Exception {
            var response = new AdminFeedbackSummaryResponse(
                    50,
                    Map.of("pending", 20L, "reviewed", 25L, "resolved", 5L),
                    Map.of("GOOD", 30L, "BAD", 10L, "DIFFICULT", 10L),
                    List.of(new AdminFeedbackSummaryResponse.DifficultRecipe(1, "마라탕", 5)));
            when(adminFeedbackService.getSummary()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/summary")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalCount").value(50));
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

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

        @Test
        @DisplayName("PATCH /status — 빈 바디 → 400")
        void 상태_null_400() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("PUT /note — note 빈값 → 400")
        void 메모_빈값_400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/1/note")
                            .header("Authorization", "Bearer " + contentAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"note":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
