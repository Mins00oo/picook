package com.picook.domain.file.dto;

public record FileUploadResponse(
        String url,
        String fileName,
        long fileSize
) {}
