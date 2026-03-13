package com.picook.domain.admin.user.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminUserSuspendRequest(
        @NotBlank(message = "정지 사유는 필수입니다") String reason
) {}
