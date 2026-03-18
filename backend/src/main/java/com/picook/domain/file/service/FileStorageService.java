package com.picook.domain.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String upload(MultipartFile file, String subDir);
    void delete(String filePath);
}
