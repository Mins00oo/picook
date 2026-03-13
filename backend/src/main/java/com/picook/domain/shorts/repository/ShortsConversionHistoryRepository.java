package com.picook.domain.shorts.repository;

import com.picook.domain.shorts.entity.ShortsConversionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ShortsConversionHistoryRepository extends JpaRepository<ShortsConversionHistory, Integer> {
    List<ShortsConversionHistory> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByCreatedAtBetween(Instant start, Instant end);

    @Query(value = "SELECT CAST(created_at AS DATE) AS day, COUNT(*) FROM shorts_conversion_history WHERE created_at BETWEEN :start AND :end GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> countDailyConversions(@Param("start") Instant start, @Param("end") Instant end);
}
