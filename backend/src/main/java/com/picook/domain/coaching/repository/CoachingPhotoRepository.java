package com.picook.domain.coaching.repository;

import com.picook.domain.coaching.entity.CoachingPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CoachingPhotoRepository extends JpaRepository<CoachingPhoto, Integer> {

    List<CoachingPhoto> findByCoachingLogIdOrderByDisplayOrder(Integer coachingLogId);

    boolean existsByCoachingLogId(Integer coachingLogId);

    int countByCoachingLogId(Integer coachingLogId);

    void deleteByCoachingLogId(Integer coachingLogId);

    @Query("SELECT COUNT(cp) FROM CoachingPhoto cp JOIN CoachingLog cl ON cp.coachingLogId = cl.id WHERE cl.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);
}
