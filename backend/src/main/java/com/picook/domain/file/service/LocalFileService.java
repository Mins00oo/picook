package com.picook.domain.file.service;

import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.global.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalFileService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/heic", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final Path uploadDir;

    public LocalFileService(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadDir = Path.of(uploadDir);
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(uploadDir);
        log.info("File upload directory: {}", uploadDir.toAbsolutePath());
    }

    /**
     * FileStorageService 인터페이스 구현.
     * @return 저장된 파일의 URL 경로 (예: /uploads/photos/2026/03/18/uuid.jpg)
     */
    @Override
    public String upload(MultipartFile file, String subDir) {
        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());
        String datePath = LocalDate.now().format(DATE_FORMAT);
        String fileName = UUID.randomUUID() + "." + extension;

        Path dir = uploadDir.resolve(subDir).resolve(datePath).normalize();
        validatePathWithinUploadDir(dir);
        Path filePath = dir.resolve(fileName);

        try {
            Files.createDirectories(dir);
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            log.error("File upload failed: {}", filePath, e);
            throw new BusinessException("FILE_UPLOAD_FAILED", "파일 업로드에 실패했습니다", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return "/uploads/" + subDir + "/" + datePath + "/" + fileName;
    }

    @Override
    public void delete(String fileUrl) {
        try {
            String relativePath = fileUrl.replaceFirst("^/uploads/", "");
            Path filePath = uploadDir.resolve(relativePath).normalize();
            validatePathWithinUploadDir(filePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.debug("Deleted file: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl, e);
        }
    }

    /**
     * FileUploadResponse를 반환하는 편의 메서드 (기존 FileController 호환용).
     */
    public FileUploadResponse uploadWithResponse(MultipartFile file, String subDir) {
        String url = upload(file, subDir);
        return new FileUploadResponse(url, file.getOriginalFilename(), file.getSize());
    }

    private void validatePathWithinUploadDir(Path path) {
        if (!path.startsWith(uploadDir.normalize())) {
            throw new BusinessException("INVALID_PATH", "잘못된 파일 경로입니다", HttpStatus.BAD_REQUEST);
        }
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
}
