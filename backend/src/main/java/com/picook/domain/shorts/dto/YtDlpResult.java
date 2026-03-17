package com.picook.domain.shorts.dto;

import java.nio.file.Path;

public record YtDlpResult(
        Path audioPath,
        String channelName,
        String originalTitle,
        Integer durationSeconds,
        String thumbnailUrl
) {}
