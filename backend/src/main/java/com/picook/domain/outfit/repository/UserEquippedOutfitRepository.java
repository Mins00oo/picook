package com.picook.domain.outfit.repository;

import com.picook.domain.outfit.entity.UserEquippedOutfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserEquippedOutfitRepository
        extends JpaRepository<UserEquippedOutfit, UserEquippedOutfit.PK> {

    List<UserEquippedOutfit> findAllByUserId(UUID userId);

    Optional<UserEquippedOutfit> findByUserIdAndSlot(UUID userId, String slot);
}
