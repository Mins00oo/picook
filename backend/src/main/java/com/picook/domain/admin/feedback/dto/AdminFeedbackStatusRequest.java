package com.picook.domain.admin.feedback.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminFeedbackStatusRequest(
        @NotBlank(message = "상태는 필수입니다") String status
) {}
