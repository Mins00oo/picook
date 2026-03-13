package com.picook.domain.searchhistory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "search_history")
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "ingredient_ids", columnDefinition = "integer[]")
    private List<Integer> ingredientIds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters", columnDefinition = "jsonb")
    private String filters;

    @Column(name = "result_count")
    private Integer resultCount;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected SearchHistory() {}

    public SearchHistory(UUID userId, List<Integer> ingredientIds, String filters, Integer resultCount) {
        this.userId = userId;
        this.ingredientIds = ingredientIds;
        this.filters = filters;
        this.resultCount = resultCount;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public List<Integer> getIngredientIds() { return ingredientIds; }
    public String getFilters() { return filters; }
    public Integer getResultCount() { return resultCount; }
    public Instant getCreatedAt() { return createdAt; }
}
