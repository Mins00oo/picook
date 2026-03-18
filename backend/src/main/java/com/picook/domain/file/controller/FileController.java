package com.picook.domain.file.controller;

import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.domain.file.service.LocalFileService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "파일", description = "파일 업로드")
@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final LocalFileService localFileService;

    public FileController(LocalFileService localFileService) {
        this.localFileService = localFileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "recipes") String category) {
        FileUploadResponse response = localFileService.uploadWithResponse(file, category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
