package com.picook.domain.attendance.repository;

import com.picook.domain.attendance.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<AttendanceLog, Long> {

    boolean existsByUserIdAndCheckDate(UUID userId, LocalDate checkDate);

    /** 최근 N건 (streak 계산용) */
    List<AttendanceLog> findTop30ByUserIdOrderByCheckDateDesc(UUID userId);

    /** 주어진 기간의 모든 출석 로그 */
    List<AttendanceLog> findByUserIdAndCheckDateBetweenOrderByCheckDateAsc(
            UUID userId, LocalDate start, LocalDate end);

    long countByUserId(UUID userId);
}
