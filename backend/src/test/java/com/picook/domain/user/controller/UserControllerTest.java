package com.picook.domain.user.controller;

import com.picook.domain.user.service.UserService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        UserController.class,
        UserControllerTest.MockConfig.class
})
class UserControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        UserService userService() {
            return Mockito.mock(UserService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("GET /me — 토큰 없이 401")
        void 프로필_조회_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/users/me"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /me — 만료 토큰 401")
        void 프로필_조회_만료토큰_401() throws Exception {
            mockMvc.perform(get("/api/v1/users/me")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("PUT /me — 토큰 없이 401")
        void 프로필_수정_토큰없이_401() throws Exception {
            mockMvc.perform(put("/api/v1/users/me"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /me — 토큰 없이 401")
        void 탈퇴_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/users/me"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
