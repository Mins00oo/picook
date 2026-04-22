package com.picook.domain.admin.dashboard.controller;

import com.picook.domain.admin.dashboard.dto.*;
import com.picook.domain.admin.dashboard.service.AdminDashboardService;
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
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminDashboardController.class,
        AdminDashboardControllerTest.MockConfig.class
})
class AdminDashboardControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminDashboardService adminDashboardService() {
            return Mockito.mock(AdminDashboardService.class);
        }
    }

    @Autowired
    AdminDashboardService adminDashboardService;

    private static final String BASE_URL = "/api/admin/dashboard";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminDashboardService);
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이 요청하면 401")
        void 토큰_없이_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/summary"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("만료된 토큰으로 요청하면 401")
        void 만료된_토큰으로_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/summary")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("일반 사용자 토큰으로 요청하면 403")
        void 일반_사용자_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL + "/summary")
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("대시보드 요약 조회 성공")
        void 요약_조회_성공() throws Exception {
            var response = new DashboardSummaryResponse(
                    100, 80, 50,
                    Map.of("LV1", 40L, "LV2", 30L, "LV3", 10L));
            when(adminDashboardService.getSummary()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/summary")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.totalUsers").value(100))
                    .andExpect(jsonPath("$.data.totalRecipes").value(50));
        }

        @Test
        @DisplayName("차트 데이터 조회 성공")
        void 차트_조회_성공() throws Exception {
            var response = new DashboardChartsResponse(
                    List.of(new DashboardChartsResponse.DailyCount(LocalDate.of(2026, 3, 31), 5)));
            when(adminDashboardService.getCharts("7d")).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/charts?period=7d")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.userSignups[0].count").value(5));
        }

        @Test
        @DisplayName("랭킹 조회 성공")
        void 랭킹_조회_성공() throws Exception {
            var response = new DashboardRankingsResponse(
                    List.of(new DashboardRankingsResponse.RecipeRanking(1, "김치찌개", 100)),
                    List.of(new DashboardRankingsResponse.IngredientRanking(1, "김치", 50)),
                    List.of(new DashboardRankingsResponse.RecentFeedback(
                            1, 1, "GOOD", "맛있어요", Instant.now())));
            when(adminDashboardService.getRankings()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/rankings")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.topRecipesByViews[0].title").value("김치찌개"));
        }
    }
}
