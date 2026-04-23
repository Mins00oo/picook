package com.picook.domain.outfit.repository;

import com.picook.domain.outfit.entity.UserOwnedOutfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserOwnedOutfitRepository extends JpaRepository<UserOwnedOutfit, Long> {

    List<UserOwnedOutfit> findAllByUserId(UUID userId);

    boolean existsByUserIdAndOutfitId(UUID userId, Long outfitId);

    long countByUserId(UUID userId);
}
