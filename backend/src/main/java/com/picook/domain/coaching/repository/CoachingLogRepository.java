package com.picook.domain.coaching.repository;

import com.picook.domain.coaching.entity.CoachingLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoachingLogRepository extends JpaRepository<CoachingLog, Integer> {

    Optional<CoachingLog> findByIdAndUserId(Integer id, UUID userId);

    Page<CoachingLog> findByUserId(UUID userId, Pageable pageable);

    long countByCompleted(Boolean completed);

    long countByUserIdAndCompleted(UUID userId, Boolean completed);

    long countByMode(String mode);

    long countByStartedAtBetween(Instant start, Instant end);

    Page<CoachingLog> findByUserIdAndCompletedTrueOrderByCompletedAtDesc(UUID userId, Pageable pageable);

    Optional<CoachingLog> findFirstByUserIdAndCompletedTrueOrderByCompletedAtAsc(UUID userId);

    @Query(value = "SELECT COUNT(DISTINCT cl.id) FROM coaching_logs cl " +
            "JOIN coaching_photos cp ON cp.coaching_log_id = cl.id " +
            "WHERE cl.user_id = :userId AND cl.completed = true", nativeQuery = true)
    long countCompletedWithPhotos(@Param("userId") UUID userId);

    @Query(value = "SELECT TO_CHAR(completed_at, 'YYYY-MM') AS ym, COUNT(*) " +
            "FROM coaching_logs WHERE user_id = :userId AND completed = true " +
            "GROUP BY ym ORDER BY ym", nativeQuery = true)
    List<Object[]> countMonthlyCompleted(@Param("userId") UUID userId);

    @Query(value = "SELECT EXTRACT(HOUR FROM started_at) AS hour, COUNT(*) FROM coaching_logs GROUP BY hour ORDER BY hour", nativeQuery = true)
    List<Object[]> findHourlyDistribution();

    @Query(value = "SELECT CAST(started_at AS DATE) AS day, COUNT(*) FROM coaching_logs WHERE started_at BETWEEN :start AND :end GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> countDailySessions(@Param("start") Instant start, @Param("end") Instant end);
}
