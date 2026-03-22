package com.picook.domain.file.service;

import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LocalFileServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileService localFileService;

    @BeforeEach
    void setUp() throws IOException {
        localFileService = new LocalFileService(tempDir.toString());
        localFileService.init();
    }

    @Test
    void 허용된_이미지_업로드_성공() throws IOException {
        MultipartFile file = mockFile("photo.jpg", "image/jpeg", 1024);

        String url = localFileService.upload(file, "recipes");

        assertThat(url).startsWith("/uploads/recipes/");
        assertThat(url).endsWith(".jpg");
    }

    @Test
    void PNG_이미지_업로드_성공() throws IOException {
        MultipartFile file = mockFile("screenshot.png", "image/png", 2048);

        String url = localFileService.upload(file, "coaching");

        assertThat(url).startsWith("/uploads/coaching/");
        assertThat(url).endsWith(".png");
    }

    @Test
    void uploadWithResponse_편의메서드() throws IOException {
        MultipartFile file = mockFile("test.jpg", "image/jpeg", 512);

        var response = localFileService.uploadWithResponse(file, "recipes");

        assertThat(response.url()).startsWith("/uploads/recipes/");
        assertThat(response.fileName()).isEqualTo("test.jpg");
        assertThat(response.fileSize()).isEqualTo(512L);
    }

    @Test
    void 허용되지_않은_파일_형식_거부() {
        MultipartFile file = mockFile("doc.pdf", "application/pdf", 1024);

        assertThatThrownBy(() -> localFileService.upload(file, "recipes"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("허용되지 않은 파일 형식");
    }

    @Test
    void 파일_크기_10MB_초과_거부() {
        MultipartFile file = mockFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);

        assertThatThrownBy(() -> localFileService.upload(file, "recipes"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("10MB");
    }

    @Test
    void 허용되지_않은_카테고리_거부() {
        MultipartFile file = mockFile("photo.jpg", "image/jpeg", 1024);

        assertThatThrownBy(() -> localFileService.upload(file, "../../admin"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("허용되지 않은 파일 카테고리");
    }

    @Test
    void 빈_파일_거부() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> localFileService.upload(file, "recipes"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("비어있습니다");
    }

    @Test
    void 파일_삭제_성공() throws IOException {
        MultipartFile file = mockFile("delete_me.jpg", "image/jpeg", 512);
        String url = localFileService.upload(file, "recipes");

        localFileService.delete(url);

        String relativePath = url.replaceFirst("^/uploads/", "");
        assertThat(tempDir.resolve(relativePath)).doesNotExist();
    }

    private MultipartFile mockFile(String name, String contentType, long size) {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(size);
        when(file.getContentType()).thenReturn(contentType);
        when(file.getOriginalFilename()).thenReturn(name);
        try {
            when(file.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[(int) Math.min(size, 1024)]));
            doAnswer(invocation -> {
                java.io.File target = invocation.getArgument(0);
                target.getParentFile().mkdirs();
                java.nio.file.Files.write(target.toPath(), new byte[(int) Math.min(size, 1024)]);
                return null;
            }).when(file).transferTo(any(java.io.File.class));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return file;
    }
}
