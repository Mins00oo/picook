package com.picook.domain.searchhistory.repository;

import com.picook.domain.searchhistory.entity.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Integer> {

    List<SearchHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<SearchHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<SearchHistory> findByIdAndUserId(Integer id, UUID userId);

    void deleteByUserId(UUID userId);
}
