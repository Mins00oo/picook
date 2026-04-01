package com.picook.domain.searchhistory.controller;

import com.picook.domain.searchhistory.service.SearchHistoryService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        SearchHistoryController.class,
        SearchHistoryControllerTest.MockConfig.class
})
class SearchHistoryControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        SearchHistoryService searchHistoryService() {
            return Mockito.mock(SearchHistoryService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("GET /search-history — 토큰 없이 401")
        void 조회_토큰없이_401() throws Exception {
            mockMvc.perform(get("/api/v1/search-history"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /search-history — 만료 토큰 401")
        void 조회_만료토큰_401() throws Exception {
            mockMvc.perform(get("/api/v1/search-history")
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /search-history/{id} — 토큰 없이 401")
        void 개별삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/search-history/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /search-history — 토큰 없이 401")
        void 전체삭제_토큰없이_401() throws Exception {
            mockMvc.perform(delete("/api/v1/search-history"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
