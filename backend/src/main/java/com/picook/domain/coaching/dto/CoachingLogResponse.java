package com.picook.domain.coaching.dto;

import com.picook.domain.coaching.entity.CoachingLog;
import java.time.Instant;
import java.util.List;

public record CoachingLogResponse(
        Integer id,
        String mode,
        List<Integer> recipeIds,
        Integer estimatedSeconds,
        Integer actualSeconds,
        boolean completed,
        Instant startedAt,
        Instant completedAt
) {
    public static CoachingLogResponse of(CoachingLog log) {
        return new CoachingLogResponse(
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
