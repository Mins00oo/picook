package com.picook.domain.file.service;

import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3FileServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private MultipartFile multipartFile;

    private S3FileService s3FileService;

    @BeforeEach
    void setUp() {
        s3FileService = new S3FileService(s3Client, "picook-bucket", "ap-northeast-2");
    }

    @Test
    void 허용된_이미지_업로드_성공() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1024L);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("photo.jpg");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[1024]));
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        FileUploadResponse response = s3FileService.upload(multipartFile);

        assertThat(response.url()).startsWith("https://picook-bucket.s3.ap-northeast-2.amazonaws.com/images/");
        assertThat(response.url()).endsWith(".jpg");
        assertThat(response.fileName()).isEqualTo("photo.jpg");
        assertThat(response.fileSize()).isEqualTo(1024L);
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void PNG_이미지_업로드_성공() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(2048L);
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getOriginalFilename()).thenReturn("screenshot.png");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[2048]));
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        FileUploadResponse response = s3FileService.upload(multipartFile);

        assertThat(response.url()).endsWith(".png");
        assertThat(response.fileName()).isEqualTo("screenshot.png");
    }

    @Test
    void 허용되지_않은_파일_형식_거부() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1024L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");

        assertThatThrownBy(() -> s3FileService.upload(multipartFile))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("허용되지 않은 파일 형식");
    }

    @Test
    void 파일_크기_10MB_초과_거부() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(11 * 1024 * 1024L);

        assertThatThrownBy(() -> s3FileService.upload(multipartFile))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("10MB");
    }

    @Test
    void 빈_파일_거부() {
        when(multipartFile.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> s3FileService.upload(multipartFile))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("비어있습니다");
    }
}
