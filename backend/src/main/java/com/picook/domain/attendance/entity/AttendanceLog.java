package com.picook.domain.attendance.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance_logs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "check_date"})
})
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "check_date", nullable = false)
    private LocalDate checkDate;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected AttendanceLog() {}

    public AttendanceLog(UUID userId, LocalDate checkDate) {
        this.userId = userId;
        this.checkDate = checkDate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public LocalDate getCheckDate() { return checkDate; }
    public Instant getCreatedAt() { return createdAt; }
}
