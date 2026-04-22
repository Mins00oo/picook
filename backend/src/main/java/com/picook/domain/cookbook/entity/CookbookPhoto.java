package com.picook.domain.cookbook.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "cookbook_photos")
public class CookbookPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cookbook_entry_id", nullable = false)
    private CookbookEntry cookbookEntry;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected CookbookPhoto() {}

    public CookbookPhoto(String photoUrl, Integer displayOrder) {
        this.photoUrl = photoUrl;
        this.displayOrder = displayOrder;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public CookbookEntry getCookbookEntry() { return cookbookEntry; }
    void setCookbookEntry(CookbookEntry cookbookEntry) { this.cookbookEntry = cookbookEntry; }
    public String getPhotoUrl() { return photoUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public Instant getCreatedAt() { return createdAt; }
}
