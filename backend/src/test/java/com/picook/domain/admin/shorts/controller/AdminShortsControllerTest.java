package com.picook.domain.admin.shorts.controller;

import com.picook.domain.admin.shorts.dto.AdminShortsCacheDetailResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsCacheListResponse;
import com.picook.domain.admin.shorts.dto.AdminShortsStatsResponse;
import com.picook.domain.admin.shorts.service.AdminShortsService;
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
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.time.Instant;
import java.util.List;
import java.util.Map;

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
        AdminShortsController.class,
        AdminShortsControllerTest.MockConfig.class
})
class AdminShortsControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminShortsService adminShortsService() {
            return Mockito.mock(AdminShortsService.class);
        }
    }

    @Autowired
    AdminShortsService adminShortsService;

    private static final String BASE_URL = "/api/admin/shorts";

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminShortsService);
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("토큰 없이 요청하면 401")
        void 토큰_없이_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/cache"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("만료된 토큰으로 요청하면 401")
        void 만료된_토큰으로_요청하면_401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/cache")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("일반 사용자 토큰으로 요청하면 403")
        void 일반_사용자_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL + "/cache")
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("CONTENT_ADMIN으로 clear-all 요청하면 403 (SUPER_ADMIN 전용)")
        void CONTENT_ADMIN_clear_all_요청하면_403() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/cache/clear-all")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("캐시 목록 조회 성공")
        void 캐시_목록_조회_성공() throws Exception {
            var item = new AdminShortsCacheListResponse(
                    1, "https://youtube.com/shorts/abc", "간장계란밥",
                    "gpt-5.4-mini", "https://img.youtube.com/thumb.jpg",
                    Instant.now(), Instant.now());
            var page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
            when(adminShortsService.getCacheList(any(), any(), eq(0), eq(10)))
                    .thenReturn(PageResponse.from(page));

            mockMvc.perform(get(BASE_URL + "/cache")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].title").value("간장계란밥"));
        }

        @Test
        @DisplayName("캐시 상세 조회 성공")
        void 캐시_상세_조회_성공() throws Exception {
            var detail = new AdminShortsCacheDetailResponse(
                    1, "https://youtube.com/shorts/abc", "abc_hash",
                    "간장계란밥", "gpt-5.4-mini", "https://img.youtube.com/thumb.jpg",
                    "{\"steps\":[]}", Instant.now(), Instant.now());
            when(adminShortsService.getCacheDetail(1)).thenReturn(detail);

            mockMvc.perform(get(BASE_URL + "/cache/1")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title").value("간장계란밥"));
        }

        @Test
        @DisplayName("캐시 개별 삭제 성공")
        void 캐시_삭제_성공() throws Exception {
            doNothing().when(adminShortsService).deleteCache(1);

            mockMvc.perform(delete(BASE_URL + "/cache/1")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("캐시 전체 초기화 성공 (SUPER_ADMIN)")
        void 캐시_전체_초기화_성공() throws Exception {
            doNothing().when(adminShortsService).clearAllCache();

            mockMvc.perform(delete(BASE_URL + "/cache/clear-all")
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("재변환 성공")
        void 재변환_성공() throws Exception {
            var detail = new AdminShortsCacheDetailResponse(
                    1, "https://youtube.com/shorts/abc", "abc_hash",
                    "간장계란밥 v2", "gpt-5.4-mini", null,
                    "{\"steps\":[]}", Instant.now(), Instant.now());
            when(adminShortsService.reconvert(1)).thenReturn(detail);

            mockMvc.perform(post(BASE_URL + "/cache/1/reconvert")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title").value("간장계란밥 v2"));
        }

        @Test
        @DisplayName("통계 조회 성공")
        void 통계_조회_성공() throws Exception {
            var response = new AdminShortsStatsResponse(
                    300, 500, 450, 50, 90.0, 12500.0,
                    Map.of("gpt-5.4-mini", 300L),
                    Map.of("AUDIO_EXTRACTION_FAILED", 30L),
                    20, 100, 3000.0, 5000.0, 4500.0);
            when(adminShortsService.getStats()).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/stats")
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.successRate").value(90.0))
                    .andExpect(jsonPath("$.data.totalCacheCount").value(300));
        }
    }
}
