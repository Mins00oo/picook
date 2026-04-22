package com.picook.domain.point.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "point_ledger")
public class PointLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PointReason reason;

    @Column(name = "ref_type", length = 30)
    private String refType;

    @Column(name = "ref_id")
    private Long refId;

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected PointLedger() {}

    public PointLedger(UUID userId, Integer amount, PointReason reason,
                       String refType, Long refId, Integer balanceAfter) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.refType = refType;
        this.refId = refId;
        this.balanceAfter = balanceAfter;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Integer getAmount() { return amount; }
    public PointReason getReason() { return reason; }
    public String getRefType() { return refType; }
    public Long getRefId() { return refId; }
    public Integer getBalanceAfter() { return balanceAfter; }
    public Instant getCreatedAt() { return createdAt; }
}
