package com.picook.domain.admin.account.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminAccountUpdateRequest(
        @NotBlank(message = "역할은 필수입니다") String role
) {}
