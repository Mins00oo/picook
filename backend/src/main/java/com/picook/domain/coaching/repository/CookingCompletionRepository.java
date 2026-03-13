package com.picook.domain.coaching.repository;

import com.picook.domain.coaching.entity.CookingCompletion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CookingCompletionRepository extends JpaRepository<CookingCompletion, Integer> {

    boolean existsByCoachingLogId(Integer coachingLogId);

    Page<CookingCompletion> findByUserId(UUID userId, Pageable pageable);

    long countByPhotoUrlIsNotNull();

    long countByUserId(UUID userId);
}
