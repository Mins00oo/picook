package com.picook.domain.file.controller;

import com.picook.domain.file.service.LocalFileService;
import com.picook.support.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {
        BaseControllerTest.SecurityTestConfig.class,
        FileController.class,
        FileControllerTest.MockConfig.class
})
class FileControllerTest extends BaseControllerTest {

    @Configuration
    static class MockConfig {
        @Bean
        LocalFileService localFileService() {
            return Mockito.mock(LocalFileService.class);
        }
    }

    @Nested
    @DisplayName("인증/인가")
    class AuthTests {

        @Test
        @DisplayName("POST /upload — 토큰 없이 401")
        void 업로드_토큰없이_401() throws Exception {
            mockMvc.perform(multipart("/api/v1/files/upload")
                            .file(new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[]{1})))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /upload — 만료 토큰 401")
        void 업로드_만료토큰_401() throws Exception {
            mockMvc.perform(multipart("/api/v1/files/upload")
                            .file(new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[]{1}))
                            .header("Authorization", "Bearer " + expiredToken()))
                    .andExpect(status().isUnauthorized());
        }
    }
}
