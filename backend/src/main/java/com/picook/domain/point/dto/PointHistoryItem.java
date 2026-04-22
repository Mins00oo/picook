package com.picook.domain.point.dto;

import com.picook.domain.point.entity.PointLedger;

import java.time.Instant;

public record PointHistoryItem(
        Long id,
        Integer amount,
        String reason,
        String refType,
        Long refId,
        Integer balanceAfter,
        Instant createdAt
) {
    public static PointHistoryItem of(PointLedger e) {
        return new PointHistoryItem(
                e.getId(),
                e.getAmount(),
                e.getReason().name(),
                e.getRefType(),
                e.getRefId(),
                e.getBalanceAfter(),
                e.getCreatedAt()
        );
    }
}
