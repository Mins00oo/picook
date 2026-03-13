package com.picook.domain.admin.user.dto;

import com.picook.domain.coaching.entity.CoachingLog;

import java.time.Instant;
import java.util.List;

public record AdminUserCoachingLogResponse(
        Integer id,
        String mode,
        List<Integer> recipeIds,
        Integer estimatedSeconds,
        Integer actualSeconds,
        Boolean completed,
        Instant startedAt,
        Instant completedAt
) {
    public static AdminUserCoachingLogResponse of(CoachingLog log) {
        return new AdminUserCoachingLogResponse(
                log.getId(),
                log.getMode(),
                log.getRecipeIds(),
                log.getEstimatedSeconds(),
                log.getActualSeconds(),
                log.getCompleted(),
                log.getStartedAt(),
                log.getCompletedAt()
        );
    }
}
