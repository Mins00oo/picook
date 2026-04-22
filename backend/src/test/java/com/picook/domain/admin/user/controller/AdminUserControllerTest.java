package com.picook.domain.admin.user.controller;

import com.picook.domain.admin.user.dto.*;
import com.picook.domain.admin.user.service.AdminUserService;
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
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        AdminUserController.class,
        AdminUserControllerTest.MockConfig.class
})
class AdminUserControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        AdminUserService adminUserService() {
            return Mockito.mock(AdminUserService.class);
        }
    }

    @Autowired
    AdminUserService adminUserService;

    private static final String BASE_URL = "/api/admin/users";
    private static final UUID TEST_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @BeforeEach
    void resetMocks() {
        Mockito.reset(adminUserService);
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
        @DisplayName("일반 사용자 토큰으로 요청하면 403")
        void 일반_사용자_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("CONTENT_ADMIN 토큰으로 SUPER_ADMIN 전용 API 요청하면 403")
        void CONTENT_ADMIN_토큰으로_요청하면_403() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + contentAdminToken()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("정상 케이스")
    class SuccessTests {

        @Test
        @DisplayName("사용자 목록 조회 성공")
        void 사용자_목록_조회_성공() throws Exception {
            var item = new AdminUserListResponse(
                    TEST_USER_ID, "user@test.com", "테스터", "KAKAO",
                    "ACTIVE", 5, Instant.now(), Instant.now());
            var page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
            when(adminUserService.getUsers(any(), any(), any(), any(), eq(0), eq(10)))
                    .thenReturn(PageResponse.from(page));

            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"))
                    .andExpect(jsonPath("$.data.content[0].displayName").value("테스터"));
        }

        @Test
        @DisplayName("사용자 상세 조회 성공")
        void 사용자_상세_조회_성공() throws Exception {
            var detail = new AdminUserDetailResponse(
                    TEST_USER_ID, "user@test.com", "테스터", null, "KAKAO",
                    "EGG", 5, 30, "ACTIVE", null,
                    Instant.now(), Instant.now(), Instant.now(),
                    new AdminUserDetailResponse.ActivitySummary(3));
            when(adminUserService.getUser(TEST_USER_ID)).thenReturn(detail);

            mockMvc.perform(get(BASE_URL + "/" + TEST_USER_ID)
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.displayName").value("테스터"))
                    .andExpect(jsonPath("$.data.characterType").value("EGG"))
                    .andExpect(jsonPath("$.data.activitySummary.favoriteCount").value(3));
        }

        @Test
        @DisplayName("사용자 정지 성공")
        void 사용자_정지_성공() throws Exception {
            doNothing().when(adminUserService).suspendUser(eq(TEST_USER_ID), any(AdminUserSuspendRequest.class));

            mockMvc.perform(patch(BASE_URL + "/" + TEST_USER_ID + "/suspend")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new AdminUserSuspendRequest("부적절한 활동"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("사용자 활성화 성공")
        void 사용자_활성화_성공() throws Exception {
            doNothing().when(adminUserService).activateUser(TEST_USER_ID);

            mockMvc.perform(patch(BASE_URL + "/" + TEST_USER_ID + "/activate")
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("success"));
        }

        @Test
        @DisplayName("사용자 즐겨찾기 조회 성공")
        void 즐겨찾기_조회_성공() throws Exception {
            var item = new AdminUserFavoriteResponse(1, 10, "김치찌개", Instant.now());
            var page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
            when(adminUserService.getFavorites(TEST_USER_ID, 0, 10))
                    .thenReturn(PageResponse.from(page));

            mockMvc.perform(get(BASE_URL + "/" + TEST_USER_ID + "/favorites")
                            .header("Authorization", "Bearer " + superAdminToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].recipeTitle").value("김치찌개"));
        }
    }

    @Nested
    @DisplayName("입력 검증")
    class ValidationTests {

        @Test
        @DisplayName("PATCH /suspend — reason 빈값 → 400")
        void 정지사유_빈값_400() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/" + TEST_USER_ID + "/suspend")
                            .header("Authorization", "Bearer " + superAdminToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"reason":""}
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
        }
    }
}
