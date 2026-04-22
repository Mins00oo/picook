package com.picook.domain.attendance.service;

import com.picook.domain.attendance.dto.AttendanceTodayResponse;
import com.picook.domain.attendance.dto.CheckInResponse;
import com.picook.domain.attendance.dto.MonthHistoryResponse;
import com.picook.domain.attendance.entity.AttendanceLog;
import com.picook.domain.attendance.repository.AttendanceRepository;
import com.picook.domain.point.entity.PointReason;
import com.picook.domain.point.service.PointService;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AttendanceService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final int DAILY_CHECK_POINTS = 10;

    private final AttendanceRepository attendanceRepository;
    private final PointService pointService;

    public AttendanceService(AttendanceRepository attendanceRepository, PointService pointService) {
        this.attendanceRepository = attendanceRepository;
        this.pointService = pointService;
    }

    @Transactional
    public CheckInResponse checkIn(UUID userId) {
        LocalDate today = LocalDate.now(KST);
        if (attendanceRepository.existsByUserIdAndCheckDate(userId, today)) {
            throw new BusinessException("ATTENDANCE_ALREADY_CHECKED",
                    "오늘은 이미 출석체크를 완료했어요", HttpStatus.CONFLICT);
        }

        AttendanceLog log = new AttendanceLog(userId, today);
        attendanceRepository.save(log);

        Integer newBalance = pointService.award(
                userId, DAILY_CHECK_POINTS, PointReason.DAILY_CHECK, "ATTENDANCE", log.getId()
        );

        int streak = calculateCurrentStreak(userId, today);
        return new CheckInResponse(today, streak, DAILY_CHECK_POINTS, newBalance);
    }

    @Transactional(readOnly = true)
    public AttendanceTodayResponse getToday(UUID userId) {
        LocalDate today = LocalDate.now(KST);
        boolean checked = attendanceRepository.existsByUserIdAndCheckDate(userId, today);
        int streak = calculateCurrentStreak(userId, today);
        int[] recent7 = buildRecentSevenDays(userId, today);
        return new AttendanceTodayResponse(today, checked, streak, recent7);
    }

    @Transactional(readOnly = true)
    public MonthHistoryResponse getMonthHistory(UUID userId, String month) {
        YearMonth ym = (month != null && !month.isBlank()) ? YearMonth.parse(month)
                : YearMonth.from(LocalDate.now(KST));
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<LocalDate> dates = attendanceRepository
                .findByUserIdAndCheckDateBetweenOrderByCheckDateAsc(userId, start, end)
                .stream().map(AttendanceLog::getCheckDate).toList();

        int current = calculateCurrentStreak(userId, LocalDate.now(KST));
        int longest = calculateLongestStreak(userId);
        long total = attendanceRepository.countByUserId(userId);
        return new MonthHistoryResponse(ym.toString(), dates, current, longest, total);
    }

    /**
     * 오늘을 포함하여 연속 출석 일수 계산.
     * 오늘 미출석 → 어제까지의 streak.
     */
    private int calculateCurrentStreak(UUID userId, LocalDate today) {
        List<AttendanceLog> recent = attendanceRepository.findTop30ByUserIdOrderByCheckDateDesc(userId);
        if (recent.isEmpty()) return 0;

        Set<LocalDate> set = new HashSet<>();
        for (AttendanceLog a : recent) set.add(a.getCheckDate());

        LocalDate cursor = set.contains(today) ? today : today.minusDays(1);
        // 연속이 끊겨있을 수 있음: 오늘/어제 모두 미출석이면 0
        if (!set.contains(cursor)) return 0;

        int streak = 0;
        while (set.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int calculateLongestStreak(UUID userId) {
        List<AttendanceLog> logs = attendanceRepository.findTop30ByUserIdOrderByCheckDateDesc(userId);
        if (logs.isEmpty()) return 0;

        // 오름차순으로 재정렬
        List<LocalDate> sorted = logs.stream().map(AttendanceLog::getCheckDate).sorted().toList();
        int best = 1, cur = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).minusDays(1).equals(sorted.get(i - 1))) {
                cur++;
                best = Math.max(best, cur);
            } else {
                cur = 1;
            }
        }
        return best;
    }

    /** 과거 6일 ~ 오늘 (길이 7, [0]=6일전, [6]=오늘) */
    private int[] buildRecentSevenDays(UUID userId, LocalDate today) {
        LocalDate start = today.minusDays(6);
        Set<LocalDate> checked = new HashSet<>();
        for (AttendanceLog a : attendanceRepository
                .findByUserIdAndCheckDateBetweenOrderByCheckDateAsc(userId, start, today)) {
            checked.add(a.getCheckDate());
        }
        int[] arr = new int[7];
        for (int i = 0; i < 7; i++) {
            arr[i] = checked.contains(start.plusDays(i)) ? 1 : 0;
        }
        return arr;
    }
}
