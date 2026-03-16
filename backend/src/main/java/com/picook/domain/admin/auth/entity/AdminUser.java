package com.picook.domain.admin.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    private AdminRole role = AdminRole.CONTENT_ADMIN;

    @Column(name = "is_locked")
    private Boolean isLocked = false;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "failed_login_count")
    private Integer failedLoginCount = 0;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected AdminUser() {}

    public AdminUser(String email, String passwordHash, AdminRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public boolean isCurrentlyLocked() {
        return Boolean.TRUE.equals(isLocked)
                && lockedUntil != null
                && lockedUntil.isAfter(Instant.now());
    }

    public void incrementFailedLogin() {
        this.failedLoginCount = (this.failedLoginCount == null ? 0 : this.failedLoginCount) + 1;
        if (this.failedLoginCount >= 5) {
            this.isLocked = true;
            this.lockedUntil = Instant.now().plusSeconds(15 * 60); // 15 minutes
        }
    }

    public void resetFailedLogin() {
        this.failedLoginCount = 0;
        this.isLocked = false;
        this.lockedUntil = null;
    }

    // Getters & Setters

    public Integer getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public AdminRole getRole() { return role; }
    public void setRole(AdminRole role) { this.role = role; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean locked) { this.isLocked = locked; }

    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }

    public Integer getFailedLoginCount() { return failedLoginCount; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Instant getCreatedAt() { return createdAt; }
}
