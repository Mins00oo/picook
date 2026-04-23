package com.picook.domain.outfit.repository;

import com.picook.domain.outfit.entity.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OutfitRepository extends JpaRepository<Outfit, Long> {

    List<Outfit> findAllByIsActiveTrueOrderBySortOrderAsc();

    List<Outfit> findAllByIsDefaultTrueAndIsActiveTrue();

    @Query("SELECT o FROM Outfit o WHERE o.unlockLevel IS NOT NULL " +
            "AND o.unlockLevel > :oldLevel AND o.unlockLevel <= :newLevel " +
            "AND o.isActive = true AND o.isDefault = false")
    List<Outfit> findLevelRewards(@Param("oldLevel") int oldLevel,
                                  @Param("newLevel") int newLevel);
}
