package com.picook.domain.admin.account.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminAccountCreateRequest(
        @NotBlank(message = "이메일은 필수입니다") String email,
        @NotBlank(message = "비밀번호는 필수입니다") String password,
        @NotBlank(message = "역할은 필수입니다") String role
) {}
