package com.picook.domain.coaching.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "coaching_photos")
public class CoachingPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "coaching_log_id", nullable = false)
    private Integer coachingLogId;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected CoachingPhoto() {}

    public CoachingPhoto(Integer coachingLogId, String photoUrl, Integer displayOrder) {
        this.coachingLogId = coachingLogId;
        this.photoUrl = photoUrl;
        this.displayOrder = displayOrder;
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public Integer getCoachingLogId() { return coachingLogId; }
    public String getPhotoUrl() { return photoUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public Instant getCreatedAt() { return createdAt; }
}
