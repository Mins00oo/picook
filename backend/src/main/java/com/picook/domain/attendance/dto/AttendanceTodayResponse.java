package com.picook.domain.attendance.dto;

import java.time.LocalDate;

public record AttendanceTodayResponse(
        LocalDate checkDate,
        boolean checkedIn,
        int streakDays,
        int[] recentSevenDays // 과거 6일~오늘 (0=미출석, 1=출석)
) {}
