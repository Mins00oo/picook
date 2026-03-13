package com.picook.domain.coaching.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cooking_completions")
public class CookingCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "recipe_id", nullable = false)
    private Integer recipeId;

    @Column(name = "coaching_log_id", nullable = false)
    private Integer coachingLogId;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected CookingCompletion() {}

    public CookingCompletion(UUID userId, Integer recipeId, Integer coachingLogId, String photoUrl) {
        this.userId = userId;
        this.recipeId = recipeId;
        this.coachingLogId = coachingLogId;
        this.photoUrl = photoUrl;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public Integer getRecipeId() { return recipeId; }
    public Integer getCoachingLogId() { return coachingLogId; }
    public String getPhotoUrl() { return photoUrl; }
    public Instant getCreatedAt() { return createdAt; }
}
