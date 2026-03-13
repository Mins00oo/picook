package com.picook.domain.shorts.dto;

import jakarta.validation.constraints.NotBlank;

public record ShortsConvertRequest(
        @NotBlank(message = "유튜브 URL은 필수입니다") String youtubeUrl
) {}
