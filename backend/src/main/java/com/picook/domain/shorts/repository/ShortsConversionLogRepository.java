package com.picook.domain.shorts.repository;

import com.picook.domain.shorts.entity.ShortsConversionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ShortsConversionLogRepository extends JpaRepository<ShortsConversionLog, Integer> {

    long countByStatus(String status);

    long countByCreatedAtAfter(Instant after);

    long countByStatusAndCreatedAtAfter(String status, Instant after);

    @Query("SELECT l.errorCode, COUNT(l) FROM ShortsConversionLog l WHERE l.status = 'FAILED' GROUP BY l.errorCode")
    List<Object[]> countFailuresByErrorCode();

    @Query("SELECT AVG(l.totalMs) FROM ShortsConversionLog l WHERE l.status = 'SUCCESS' AND l.cacheHit = false")
    Double avgProcessingTimeMs();

    @Query("SELECT AVG(l.extractMs) FROM ShortsConversionLog l WHERE l.status = 'SUCCESS' AND l.cacheHit = false")
    Double avgExtractMs();

    @Query("SELECT AVG(l.transcribeMs) FROM ShortsConversionLog l WHERE l.status = 'SUCCESS' AND l.cacheHit = false")
    Double avgTranscribeMs();

    @Query("SELECT AVG(l.structurizeMs) FROM ShortsConversionLog l WHERE l.status = 'SUCCESS' AND l.cacheHit = false")
    Double avgStructurizeMs();

    long countByCacheHit(boolean cacheHit);

    @Query(value = "SELECT COUNT(*) FROM shorts_conversion_log WHERE user_id = :userId AND created_at > :after", nativeQuery = true)
    long countByUserIdAndCreatedAtAfter(@Param("userId") java.util.UUID userId, @Param("after") Instant after);
}
