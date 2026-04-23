package com.picook.domain.outfit.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "level_reward_logs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "level"}))
public class LevelRewardLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "level", nullable = false)
    private Short level;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected LevelRewardLog() {}

    public LevelRewardLog(UUID userId, Short level) {
        this.userId = userId;
        this.level = level;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Short getLevel() { return level; }
    public Instant getCreatedAt() { return createdAt; }
}
