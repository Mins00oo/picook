package com.picook.domain.shorts.repository;

import com.picook.domain.shorts.entity.ShortsFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShortsFavoriteRepository extends JpaRepository<ShortsFavorite, Integer> {
    List<ShortsFavorite> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ShortsFavorite> findByIdAndUserId(Integer id, UUID userId);
    boolean existsByUserIdAndShortsCacheId(UUID userId, Integer shortsCacheId);
    int countByUserId(UUID userId);
}
