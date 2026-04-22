package com.picook.domain.attendance.controller;

import com.picook.domain.attendance.dto.AttendanceTodayResponse;
import com.picook.domain.attendance.dto.CheckInResponse;
import com.picook.domain.attendance.dto.MonthHistoryResponse;
import com.picook.domain.attendance.service.AttendanceService;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "출석체크", description = "매일 출석 + 연속 일수 + 월별 내역")
@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceTodayResponse>> getToday() {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getToday(getCurrentUserId())
        ));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn() {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.checkIn(getCurrentUserId())
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<MonthHistoryResponse>> getHistory(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getMonthHistory(getCurrentUserId(), month)
        ));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
