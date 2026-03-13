package com.picook.domain.admin.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminRefreshRequest(
        @NotBlank(message = "리프레시 토큰은 필수입니다") String refreshToken
) {}
