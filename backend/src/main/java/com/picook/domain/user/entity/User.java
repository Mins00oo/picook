package com.picook.domain.user.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email")
    private String email;

    @Column(name = "display_name", length = 50)
    private String displayName;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_type", nullable = false, length = 20)
    private LoginType loginType;

    @Column(name = "kakao_id", length = 100)
    private String kakaoId;

    @Column(name = "apple_id", length = 100)
    private String appleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "cooking_level", length = 20)
    private CookingLevel cookingLevel = CookingLevel.BEGINNER;

    @Column(name = "coaching_enabled")
    private Boolean coachingEnabled = true;

    @Column(name = "coaching_voice_speed", precision = 2, scale = 1)
    private BigDecimal coachingVoiceSpeed = new BigDecimal("1.0");

    @Column(name = "completed_cooking_count")
    private Integer completedCookingCount = 0;

    @Column(name = "is_onboarded")
    private Boolean isOnboarded = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "suspended_reason")
    private String suspendedReason;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    protected User() {}

    public User(LoginType loginType) {
        this.loginType = loginType;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters & Setters

    public UUID getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public LoginType getLoginType() { return loginType; }

    public String getKakaoId() { return kakaoId; }
    public void setKakaoId(String kakaoId) { this.kakaoId = kakaoId; }

    public String getAppleId() { return appleId; }
    public void setAppleId(String appleId) { this.appleId = appleId; }

    public CookingLevel getCookingLevel() { return cookingLevel; }
    public void setCookingLevel(CookingLevel cookingLevel) { this.cookingLevel = cookingLevel; }

    public Boolean getCoachingEnabled() { return coachingEnabled; }
    public void setCoachingEnabled(Boolean coachingEnabled) { this.coachingEnabled = coachingEnabled; }

    public BigDecimal getCoachingVoiceSpeed() { return coachingVoiceSpeed; }
    public void setCoachingVoiceSpeed(BigDecimal coachingVoiceSpeed) { this.coachingVoiceSpeed = coachingVoiceSpeed; }

    public Integer getCompletedCookingCount() { return completedCookingCount; }
    public void setCompletedCookingCount(Integer completedCookingCount) { this.completedCookingCount = completedCookingCount; }

    public Boolean getIsOnboarded() { return isOnboarded; }
    public void setIsOnboarded(Boolean onboarded) { this.isOnboarded = onboarded; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }

    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
