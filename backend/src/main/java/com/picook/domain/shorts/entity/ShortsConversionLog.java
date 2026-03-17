package com.picook.domain.shorts.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shorts_conversion_log")
public class ShortsConversionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "youtube_url", nullable = false, length = 500)
    private String youtubeUrl;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "cache_hit", nullable = false)
    private boolean cacheHit;

    @Column(name = "total_ms")
    private Long totalMs;

    @Column(name = "extract_ms")
    private Long extractMs;

    @Column(name = "transcribe_ms")
    private Long transcribeMs;

    @Column(name = "structurize_ms")
    private Long structurizeMs;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected ShortsConversionLog() {}

    public static ShortsConversionLog success(UUID userId, String youtubeUrl, boolean cacheHit,
                                               long totalMs, Long extractMs, Long transcribeMs, Long structurizeMs) {
        ShortsConversionLog log = new ShortsConversionLog();
        log.userId = userId;
        log.youtubeUrl = youtubeUrl;
        log.status = "SUCCESS";
        log.cacheHit = cacheHit;
        log.totalMs = totalMs;
        log.extractMs = extractMs;
        log.transcribeMs = transcribeMs;
        log.structurizeMs = structurizeMs;
        return log;
    }

    public static ShortsConversionLog failure(UUID userId, String youtubeUrl,
                                               String errorCode, String errorMessage, long totalMs) {
        ShortsConversionLog log = new ShortsConversionLog();
        log.userId = userId;
        log.youtubeUrl = youtubeUrl;
        log.status = "FAILED";
        log.errorCode = errorCode;
        log.errorMessage = errorMessage;
        log.cacheHit = false;
        log.totalMs = totalMs;
        return log;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public String getStatus() { return status; }
    public String getErrorCode() { return errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public boolean isCacheHit() { return cacheHit; }
    public Long getTotalMs() { return totalMs; }
    public Long getExtractMs() { return extractMs; }
    public Long getTranscribeMs() { return transcribeMs; }
    public Long getStructurizeMs() { return structurizeMs; }
    public Instant getCreatedAt() { return createdAt; }
}
