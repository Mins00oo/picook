package com.picook.domain.point.repository;

import com.picook.domain.point.entity.PointLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PointLedgerRepository extends JpaRepository<PointLedger, Long> {
    Page<PointLedger> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
