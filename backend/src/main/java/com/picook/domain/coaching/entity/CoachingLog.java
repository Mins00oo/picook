package com.picook.domain.coaching.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "coaching_logs")
public class CoachingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "mode", nullable = false, length = 10)
    private String mode;

    @Column(name = "recipe_ids", columnDefinition = "integer[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<Integer> recipeIds;

    @Column(name = "shorts_cache_id")
    private Integer shortsCacheId;

    @Column(name = "estimated_seconds")
    private Integer estimatedSeconds;

    @Column(name = "actual_seconds")
    private Integer actualSeconds;

    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "started_at", updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected CoachingLog() {}

    public CoachingLog(UUID userId, String mode, List<Integer> recipeIds, Integer estimatedSeconds) {
        this.userId = userId;
        this.mode = mode;
        this.recipeIds = recipeIds;
        this.estimatedSeconds = estimatedSeconds;
    }

    public CoachingLog(UUID userId, String mode, Integer shortsCacheId, Integer estimatedSeconds) {
        this.userId = userId;
        this.mode = mode;
        this.recipeIds = List.of();
        this.shortsCacheId = shortsCacheId;
        this.estimatedSeconds = estimatedSeconds;
    }

    @PrePersist
    protected void onCreate() {
        this.startedAt = Instant.now();
    }

    public void complete(int actualSeconds) {
        this.completed = true;
        this.actualSeconds = actualSeconds;
        this.completedAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getMode() { return mode; }
    public List<Integer> getRecipeIds() { return recipeIds; }
    public Integer getShortsCacheId() { return shortsCacheId; }
    public Integer getEstimatedSeconds() { return estimatedSeconds; }
    public Integer getActualSeconds() { return actualSeconds; }
    public Boolean getCompleted() { return completed; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
}
