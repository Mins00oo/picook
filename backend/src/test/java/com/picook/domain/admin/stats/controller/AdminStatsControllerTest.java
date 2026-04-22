package com.picook.domain.admin.stats.controller;

import com.picook.domain.admin.stats.dto.*;
import com.picook.domain.admin.stats.service.AdminStatsService;
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
        AdminStatsController.class,
        AdminStatsControllerTest.MockConfig.class
})
class AdminStatsControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminStatsService adminStatsService() {
            return Mockito.mock(AdminStatsService.class);
        }
    }

    @Autowired
    AdminStatsService adminStatsService;

    private static final String BASE_URL = "/api/admin/stats";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminStatsService);
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이 요청하면 401")
        void 토큰_없이_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/users"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("일반 사용자 토큰으로 요청하면 403")
        void 일반_사용자_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL + "/users")
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("VIEWER 토큰으로 GET 요청하면 200")
        void VIEWER_토큰으로_GET_요청_성공() throws Exception {
            var response = new UserStatsResponse(100, 80,
                    Map.of("KAKAO", 60L, "APPLE", 40L),
                    List.of(), 20, 50);
            when(adminStatsService.getUserStats()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/users")
                            .header("Authorization", "Bearer " + viewerToken()))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("사용자 통계 조회 성공")
        void 사용자_통계_조회_성공() throws Exception {
            var response = new UserStatsResponse(100, 80,
                    Map.of("KAKAO", 60L, "APPLE", 40L),
                    List.of(new UserStatsResponse.DailyCount(LocalDate.of(2026, 3, 31), 5)),
                    20, 50);
            when(adminStatsService.getUserStats()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/users")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalUsers").value(100))
                    .andExpect(jsonPath("$.data.dau").value(20));
        }

        @Test
        @DisplayName("레시피 통계 조회 성공")
        void 레시피_통계_조회_성공() throws Exception {
            var response = new RecipeStatsResponse(50,
                    Map.of("한식", 30L, "양식", 20L),
                    Map.of("EASY", 20L, "MEDIUM", 30L),
                    List.of(new RecipeStatsResponse.RecipeItem(1, "김치찌개", 100)));
            when(adminStatsService.getRecipeStats()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/recipes")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalRecipes").value(50));
        }

        @Test
        @DisplayName("재료 통계 조회 성공")
        void 재료_통계_조회_성공() throws Exception {
            var response = new IngredientStatsResponse(200,
                    List.of(new IngredientStatsResponse.IngredientItem(1, "김치", 50L)),
                    List.of(new IngredientStatsResponse.UnusedIngredient(99, "트러플오일")));
            when(adminStatsService.getIngredientStats()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/ingredients")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalIngredients").value(200));
        }
    }
}
