package com.picook.domain.ingredient.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ingredient_subcategories",
       uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "name"}))
public class IngredientSubcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private IngredientCategory category;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 8)
    private String emoji;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected IngredientSubcategory() {}

    public IngredientSubcategory(IngredientCategory category, String name, String emoji, Integer sortOrder) {
        this.category = category;
        this.name = name;
        this.emoji = emoji;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    @PrePersist
    protected void onCreate() { this.createdAt = Instant.now(); }

    public Integer getId() { return id; }
    public IngredientCategory getCategory() { return category; }
    public void setCategory(IngredientCategory category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Instant getCreatedAt() { return createdAt; }
}
