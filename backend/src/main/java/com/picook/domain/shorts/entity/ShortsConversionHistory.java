package com.picook.domain.shorts.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shorts_conversion_history")
public class ShortsConversionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shorts_cache_id", nullable = false)
    private ShortsCache shortsCache;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected ShortsConversionHistory() {}

    public ShortsConversionHistory(UUID userId, ShortsCache shortsCache) {
        this.userId = userId;
        this.shortsCache = shortsCache;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public ShortsCache getShortsCache() { return shortsCache; }
    public Instant getCreatedAt() { return createdAt; }
}
