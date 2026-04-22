package com.picook.domain.monitoring.controller;

import com.picook.domain.admin.dashboard.dto.DashboardSummaryResponse;
import com.picook.domain.admin.dashboard.service.AdminDashboardService;
import com.picook.domain.admin.stats.dto.UserStatsResponse;
import com.picook.domain.admin.stats.service.AdminStatsService;
import com.picook.domain.ingredient.repository.IngredientRepository;
import com.picook.domain.user.repository.UserRepository;
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
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        MonitoringController.class,
        MonitoringControllerTest.MockConfig.class
})
class MonitoringControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminStatsService adminStatsService() {
            return Mockito.mock(AdminStatsService.class);
        }

        @Bean
        AdminDashboardService adminDashboardService() {
            return Mockito.mock(AdminDashboardService.class);
        }

        @Bean
        UserRepository userRepository() {
            return Mockito.mock(UserRepository.class);
        }

        @Bean
        IngredientRepository ingredientRepository() {
            return Mockito.mock(IngredientRepository.class);
        }
    }

    @Autowired AdminStatsService adminStatsService;
    @Autowired AdminDashboardService adminDashboardService;
    @Autowired UserRepository userRepository;
    @Autowired IngredientRepository ingredientRepository;

    private static final String BASE_URL = "/api/monitoring";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminStatsService, adminDashboardService, userRepository, ingredientRepository);
    }

    @Nested
    @DisplayName("인증/인가 — 공개 API")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이도 접근 가능 (permitAll)")
        void 토큰_없이_접근_가능() throws Exception {
            var stats = new UserStatsResponse(100, 80,
                    Map.of("KAKAO", 60L), List.of(), 20, 50);
            when(adminStatsService.getUserStats()).thenReturn(stats);
            when(userRepository.countByLastLoginAtAfter(any(Instant.class))).thenReturn(30L);
            when(userRepository.countByCreatedAtBetween(any(Instant.class), any(Instant.class))).thenReturn(5L);

            mockMvc.perform(get(BASE_URL + "/users"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("사용자 모니터링 조회 성공")
        void 사용자_모니터링_성공() throws Exception {
            var stats = new UserStatsResponse(100, 80,
                    Map.of("KAKAO", 60L), List.of(), 20, 50);
            when(adminStatsService.getUserStats()).thenReturn(stats);
            when(userRepository.countByLastLoginAtAfter(any(Instant.class))).thenReturn(30L);
            when(userRepository.countByCreatedAtBetween(any(Instant.class), any(Instant.class))).thenReturn(5L);

            mockMvc.perform(get(BASE_URL + "/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.dau").value(20))
                    .andExpect(jsonPath("$.data.wau").value(30))
                    .andExpect(jsonPath("$.data.totalUsers").value(100));
        }

        @Test
        @DisplayName("대시보드 모니터링 조회 성공")
        void 대시보드_모니터링_성공() throws Exception {
            var summary = new DashboardSummaryResponse(100, 80, 50, Map.of());
            when(adminDashboardService.getSummary()).thenReturn(summary);
            when(ingredientRepository.count()).thenReturn(200L);

            mockMvc.perform(get(BASE_URL + "/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalRecipes").value(50))
                    .andExpect(jsonPath("$.data.totalIngredients").value(200));
        }
    }
}
