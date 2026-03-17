package com.picook.domain.shorts.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "shorts_cache")
public class ShortsCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "youtube_url", nullable = false, length = 500)
    private String youtubeUrl;

    @Column(name = "url_hash", nullable = false, unique = true, length = 64)
    private String urlHash;

    @Column(name = "ai_model_version", nullable = false, length = 50)
    private String aiModelVersion;

    @Column(name = "title", length = 500)
    private String title;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result", nullable = false, columnDefinition = "jsonb")
    private String result;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    protected ShortsCache() {}

    public ShortsCache(String youtubeUrl, String urlHash, String aiModelVersion,
                       String title, String thumbnailUrl, String result) {
        this.youtubeUrl = youtubeUrl;
        this.urlHash = urlHash;
        this.aiModelVersion = aiModelVersion;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.result = result;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void update(String aiModelVersion, String title, String result) {
        this.aiModelVersion = aiModelVersion;
        this.title = title;
        this.result = result;
    }

    public Integer getId() { return id; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public String getUrlHash() { return urlHash; }
    public String getAiModelVersion() { return aiModelVersion; }
    public String getTitle() { return title; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getResult() { return result; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
