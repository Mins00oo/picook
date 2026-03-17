package com.picook.domain.shorts.repository;

import com.picook.domain.shorts.entity.ShortsCache;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ShortsCacheRepository extends JpaRepository<ShortsCache, Integer> {
    Optional<ShortsCache> findByUrlHashAndAiModelVersion(String urlHash, String aiModelVersion);

    @Query(value = "SELECT s FROM ShortsCache s " +
            "WHERE (:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
            "       OR LOWER(s.youtubeUrl) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))) " +
            "AND (:modelVersion IS NULL OR s.aiModelVersion = :modelVersion)",
            countQuery = "SELECT COUNT(s) FROM ShortsCache s " +
                    "WHERE (:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) " +
                    "       OR LOWER(s.youtubeUrl) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))) " +
                    "AND (:modelVersion IS NULL OR s.aiModelVersion = :modelVersion)")
    Page<ShortsCache> searchCache(@Param("keyword") String keyword,
                                   @Param("modelVersion") String modelVersion,
                                   Pageable pageable);

    long countByAiModelVersion(String aiModelVersion);

    @Query("SELECT s.aiModelVersion, COUNT(s) FROM ShortsCache s GROUP BY s.aiModelVersion")
    java.util.List<Object[]> countByModelVersion();
}
