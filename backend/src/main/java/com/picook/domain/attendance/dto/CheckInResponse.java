package com.picook.domain.attendance.dto;

import java.time.LocalDate;

public record CheckInResponse(
        LocalDate checkDate,
        int streakDays,
        int pointsEarned,
        int pointBalance
) {}
