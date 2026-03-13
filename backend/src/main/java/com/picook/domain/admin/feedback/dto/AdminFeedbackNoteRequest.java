package com.picook.domain.admin.feedback.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminFeedbackNoteRequest(
        @NotBlank(message = "메모는 필수입니다") String note
) {}
