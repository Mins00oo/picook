package com.picook.domain.file.service;

import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.global.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class S3FileService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/heic", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final S3Client s3Client;
    private final String bucket;
    private final String region;

    public S3FileService(S3Client s3Client,
                         @Value("${aws.s3.bucket}") String bucket,
                         @Value("${aws.s3.region}") String region) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;
    }

    public FileUploadResponse upload(MultipartFile file) {
        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());
        String key = "images/" + LocalDate.now().format(DATE_FORMAT) + "/" + UUID.randomUUID() + "." + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new BusinessException("FILE_UPLOAD_FAILED", "파일 업로드에 실패했습니다", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        return new FileUploadResponse(url, file.getOriginalFilename(), file.getSize());
    }

    public void delete(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3Client.deleteObject(deleteRequest);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("FILE_EMPTY", "파일이 비어있습니다", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("FILE_TOO_LARGE", "파일 크기는 10MB를 초과할 수 없습니다", HttpStatus.BAD_REQUEST);
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("FILE_TYPE_NOT_ALLOWED", "허용되지 않은 파일 형식입니다", HttpStatus.BAD_REQUEST);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String extractKeyFromUrl(String url) {
        String prefix = "https://" + bucket + ".s3." + region + ".amazonaws.com/";
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        // fallback: extract after .amazonaws.com/
        int idx = url.indexOf(".amazonaws.com/");
        if (idx >= 0) {
            return url.substring(idx + ".amazonaws.com/".length());
        }
        return url;
    }
}
