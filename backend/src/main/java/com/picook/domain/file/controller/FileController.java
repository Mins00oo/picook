package com.picook.domain.file.controller;

import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.domain.file.service.S3FileService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final S3FileService s3FileService;

    public FileController(S3FileService s3FileService) {
        this.s3FileService = s3FileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> upload(
            @RequestParam("file") MultipartFile file) {
        FileUploadResponse response = s3FileService.upload(file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
