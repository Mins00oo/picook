package com.picook.domain.ingredient.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private IngredientCategory category;

    @Column(name = "icon_url")
    private String iconUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private IngredientSubcategory subcategory;

    @Column(name = "emoji", length = 8)
    private String emoji;

    @BatchSize(size = 100)
    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IngredientSynonym> synonyms = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Ingredient() {}

    public Ingredient(String name, IngredientCategory category) {
        this.name = name;
        this.category = category;
    }

    public Ingredient(String name, IngredientCategory category, IngredientSubcategory subcategory, String emoji) {
        this(name, category);
        this.subcategory = subcategory;
        this.emoji = emoji;
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

    public void addSynonym(String synonym) {
        this.synonyms.add(new IngredientSynonym(this, synonym));
    }

    public void clearSynonyms() {
        this.synonyms.clear();
    }

    // Getters & Setters

    public Integer getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public IngredientCategory getCategory() { return category; }
    public void setCategory(IngredientCategory category) { this.category = category; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public IngredientSubcategory getSubcategory() { return subcategory; }
    public void setSubcategory(IngredientSubcategory subcategory) { this.subcategory = subcategory; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public List<IngredientSynonym> getSynonyms() { return synonyms; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
}
