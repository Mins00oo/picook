package com.picook.domain.cookbook.repository;

import com.picook.domain.cookbook.entity.CookbookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CookbookEntryRepository extends JpaRepository<CookbookEntry, Long> {

    @EntityGraph(attributePaths = {"photos", "recipe"})
    Page<CookbookEntry> findByUserIdOrderByCookedAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"photos", "recipe"})
    Optional<CookbookEntry> findByIdAndUserId(Long id, UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndCookedAtBetween(UUID userId, Instant from, Instant to);
}
