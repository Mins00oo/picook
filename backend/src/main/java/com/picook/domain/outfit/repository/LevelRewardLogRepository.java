package com.picook.domain.outfit.repository;

import com.picook.domain.outfit.entity.LevelRewardLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LevelRewardLogRepository extends JpaRepository<LevelRewardLog, Long> {

    boolean existsByUserIdAndLevel(UUID userId, Short level);

    List<LevelRewardLog> findAllByUserId(UUID userId);
}
