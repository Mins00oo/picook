package com.picook.domain.outfit.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_owned_outfits",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "outfit_id"}))
public class UserOwnedOutfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "outfit_id", nullable = false)
    private Long outfitId;

    /** SHOP / LEVEL_REWARD / DEFAULT */
    @Column(name = "acquired_source", nullable = false, length = 16)
    private String acquiredSource;

    @Column(name = "acquired_at", nullable = false)
    private Instant acquiredAt;

    protected UserOwnedOutfit() {}

    public UserOwnedOutfit(UUID userId, Long outfitId, String acquiredSource) {
        this.userId = userId;
        this.outfitId = outfitId;
        this.acquiredSource = acquiredSource;
    }

    @PrePersist
    protected void onCreate() {
        if (this.acquiredAt == null) this.acquiredAt = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Long getOutfitId() { return outfitId; }
    public String getAcquiredSource() { return acquiredSource; }
    public Instant getAcquiredAt() { return acquiredAt; }
}
