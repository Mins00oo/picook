package com.picook.domain.coaching.controller;

import com.picook.domain.coaching.dto.CookingHistoryDetailResponse;
import com.picook.domain.coaching.dto.CookingHistoryResponse;
import com.picook.domain.coaching.dto.CookingStatsResponse;
import com.picook.domain.coaching.dto.CoachingPhotoResponse;
import com.picook.domain.coaching.service.CookingHistoryService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        CookingHistoryController.class,
        CookingHistoryControllerTest.MockConfig.class
})
class CookingHistoryControllerTest extends BaseControllerTest {

    @Configuration
    @EnableSpringDataWebSupport
    static class MockConfig {
        @Bean
        CookingHistoryService cookingHistoryService() {
            return Mockito.mock(CookingHistoryService.class);
        }
    }

    @Autowired
    CookingHistoryService cookingHistoryService;

    private static final String BASE_URL = "/api/v1/cooking";
    private static final UUID TEST_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void resetMocks() {
        Mockito.reset(cookingHistoryService);
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이 요청하면 401")
        void 토큰_없이_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/history"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("만료된 토큰으로 요청하면 401")
        void 만료된_토큰으로_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/history")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("요리 기록 목록 조회 성공")
        void 기록_목록_조회_성공() throws Exception {
            var photo = new CoachingPhotoResponse(1, "/uploads/photo.jpg", 0);
            var item = new CookingHistoryResponse(
                    1, "single", "김치찌개", "/uploads/thumb.jpg",
                    1800, 2000, Instant.now(), List.of(photo), false);
            var page = new PageImpl<>(List.of(item));
            when(cookingHistoryService.getHistory(eq(TEST_USER_ID), any(Pageable.class)))
                    .thenReturn(page);

            mockMvc.perform(get(BASE_URL + "/history")
                            .header("Authorization", "Bearer " + userTokenWithId(TEST_USER_ID)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].title").value("김치찌개"))
                    .andExpect(jsonPath("$.data.content[0].mode").value("single"));
        }

        @Test
        @DisplayName("요리 기록 상세 조회 성공")
        void 기록_상세_조회_성공() throws Exception {
            var recipeInfo = new CookingHistoryDetailResponse.RecipeInfo(1, "김치찌개", "/uploads/img.jpg");
            var detail = new CookingHistoryDetailResponse(
                    1, "single", "김치찌개", 1800, 2000,
                    Instant.now(), Instant.now(),
                    List.of(recipeInfo), List.of());
            when(cookingHistoryService.getHistoryDetail(TEST_USER_ID, 1)).thenReturn(detail);

            mockMvc.perform(get(BASE_URL + "/history/1")
                            .header("Authorization", "Bearer " + userTokenWithId(TEST_USER_ID)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title").value("김치찌개"))
                    .andExpect(jsonPath("$.data.recipes[0].title").value("김치찌개"));
        }

        @Test
        @DisplayName("요리 통계 조회 성공")
        void 통계_조회_성공() throws Exception {
            var stats = new CookingStatsResponse(
                    10, 8, 12, Instant.now(),
                    List.of(new CookingStatsResponse.MonthlyCount("2026-03", 5)),
                    3, "집밥 요리사", null);
            when(cookingHistoryService.getStats(TEST_USER_ID)).thenReturn(stats);

            mockMvc.perform(get(BASE_URL + "/stats")
                            .header("Authorization", "Bearer " + userTokenWithId(TEST_USER_ID)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalCompleted").value(10))
                    .andExpect(jsonPath("$.data.currentLevel").value(3));
        }
    }
}
