package com.picook.domain.attendance.dto;

import com.picook.domain.outfit.dto.OutfitResponse;

import java.time.LocalDate;
import java.util.List;

public record CheckInResponse(
        LocalDate checkDate,
        int streakDays,
        int pointsEarned,
        int pointBalance,
        int expEarned,
        long totalExp,
        int level,
        boolean leveledUp,
        Integer newLevel,
        List<OutfitResponse> grantedOutfits
) {}
