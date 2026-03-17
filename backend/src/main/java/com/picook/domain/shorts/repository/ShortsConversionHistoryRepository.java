package com.picook.domain.shorts.repository;

import com.picook.domain.shorts.entity.ShortsConversionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShortsConversionHistoryRepository extends JpaRepository<ShortsConversionHistory, Integer> {
    List<ShortsConversionHistory> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query(value = "SELECT * FROM (" +
            "SELECT DISTINCT ON (sc.youtube_url) h.* " +
            "FROM shorts_conversion_history h " +
            "JOIN shorts_cache sc ON h.shorts_cache_id = sc.id " +
            "WHERE h.user_id = :userId " +
            "ORDER BY sc.youtube_url, h.created_at DESC" +
            ") sub ORDER BY created_at DESC LIMIT 20",
            nativeQuery = true)
    List<ShortsConversionHistory> findRecentByUserIdDistinctUrl(@Param("userId") UUID userId);

    boolean existsByUserIdAndShortsCacheId(UUID userId, Integer shortsCacheId);

    Optional<ShortsConversionHistory> findByIdAndUserId(Integer id, UUID userId);

    void deleteAllByUserId(UUID userId);

    long countByCreatedAtBetween(Instant start, Instant end);

    @Query(value = "SELECT CAST(created_at AS DATE) AS day, COUNT(*) FROM shorts_conversion_history WHERE created_at BETWEEN :start AND :end GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> countDailyConversions(@Param("start") Instant start, @Param("end") Instant end);
}
