package com.picook.domain.outfit.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "outfits")
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** head / top / bottom / shoes / leftHand / rightHand */
    @Column(name = "slot", nullable = false, length = 16)
    private String slot;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "price_points", nullable = false)
    private Integer pricePoints = 0;

    /** NULL = 상점 판매 전용, 숫자면 해당 레벨 도달 시 자동 지급 */
    @Column(name = "unlock_level")
    private Short unlockLevel;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected Outfit() {}

    public Outfit(String slot, String name, String imageUrl, Integer pricePoints,
                  Short unlockLevel, Boolean isDefault) {
        this.slot = slot;
        this.name = name;
        this.imageUrl = imageUrl;
        this.pricePoints = pricePoints;
        this.unlockLevel = unlockLevel;
        this.isDefault = isDefault != null && isDefault;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getPricePoints() { return pricePoints; }
    public void setPricePoints(Integer pricePoints) { this.pricePoints = pricePoints; }

    public Short getUnlockLevel() { return unlockLevel; }
    public void setUnlockLevel(Short unlockLevel) { this.unlockLevel = unlockLevel; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Instant getCreatedAt() { return createdAt; }
}
