package com.picook.domain.recipe.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "difficulty", nullable = false, length = 20)
    private String difficulty;

    @Column(name = "cooking_time_minutes", nullable = false)
    private Integer cookingTimeMinutes;

    @Column(name = "servings", nullable = false)
    private Integer servings = 2;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "tips")
    private String tips;

    @Column(name = "total_ingredients")
    private Integer totalIngredients = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "coaching_ready")
    private Boolean coachingReady = false;

    @Column(name = "status", length = 20)
    private String status = "draft";

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecipeIngredient> ingredients = new LinkedHashSet<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    private Set<RecipeStep> steps = new LinkedHashSet<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Recipe() {}

    public Recipe(String title, String category, String difficulty, Integer cookingTimeMinutes, Integer servings) {
        this.title = title;
        this.category = category;
        this.difficulty = difficulty;
        this.cookingTimeMinutes = cookingTimeMinutes;
        this.servings = servings;
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

    // Helpers

    public void addIngredient(RecipeIngredient ingredient) {
        this.ingredients.add(ingredient);
        this.totalIngredients = this.ingredients.size();
    }

    public void clearIngredients() {
        this.ingredients.clear();
        this.totalIngredients = 0;
    }

    public void addStep(RecipeStep step) {
        this.steps.add(step);
    }

    public void clearSteps() {
        this.steps.clear();
    }

    public void softDelete() {
        this.isDeleted = true;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    // Getters & Setters

    public Integer getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getCookingTimeMinutes() { return cookingTimeMinutes; }
    public void setCookingTimeMinutes(Integer cookingTimeMinutes) { this.cookingTimeMinutes = cookingTimeMinutes; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getTips() { return tips; }
    public void setTips(String tips) { this.tips = tips; }

    public Integer getTotalIngredients() { return totalIngredients; }

    public Integer getViewCount() { return viewCount; }

    public Boolean getCoachingReady() { return coachingReady; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsDeleted() { return isDeleted; }

    public Set<RecipeIngredient> getIngredients() { return ingredients; }

    public Set<RecipeStep> getSteps() { return steps; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
}
