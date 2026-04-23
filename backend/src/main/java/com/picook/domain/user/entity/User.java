package com.picook.domain.user.entity;

import jakarta.persistence.*;
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

    /** v1.0 캐릭터 타입 — EGG / POTATO / CARROT */
    @Column(name = "character_type", length = 20)
    private String characterType;

    @Column(name = "completed_cooking_count")
    private Integer completedCookingCount = 0;

    /** v1.0 게임화 — 누적 경험치 (레벨 산정 기준) */
    @Column(name = "total_exp", nullable = false)
    private Long totalExp = 0L;

    @Column(name = "point_balance", nullable = false)
    private Integer pointBalance = 0;

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

    public String getCharacterType() { return characterType; }
    public void setCharacterType(String characterType) { this.characterType = characterType; }

    public Integer getCompletedCookingCount() { return completedCookingCount; }
    public void setCompletedCookingCount(Integer completedCookingCount) { this.completedCookingCount = completedCookingCount; }

    public Long getTotalExp() { return totalExp; }
    public void setTotalExp(Long totalExp) { this.totalExp = totalExp; }

    public Integer getPointBalance() { return pointBalance; }
    public void setPointBalance(Integer pointBalance) { this.pointBalance = pointBalance; }

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
