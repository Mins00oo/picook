package com.picook.domain.attendance.dto;

import java.time.LocalDate;
import java.util.List;

public record MonthHistoryResponse(
        String month, // yyyy-MM
        List<LocalDate> checkedDates,
        int currentStreak,
        int longestStreak,
        long totalDays
) {}
