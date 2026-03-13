package com.picook.domain.admin.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminPasswordChangeRequest(
        @NotBlank(message = "현재 비밀번호는 필수입니다") String currentPassword,
        @NotBlank(message = "새 비밀번호는 필수입니다") String newPassword
) {}
