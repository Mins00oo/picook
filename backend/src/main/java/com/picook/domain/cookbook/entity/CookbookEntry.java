package com.picook.domain.cookbook.entity;

import com.picook.domain.recipe.entity.Recipe;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cookbook_entries")
public class CookbookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private Short rating;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "cooked_at", nullable = false)
    private Instant cookedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "cookbookEntry", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<CookbookPhoto> photos = new ArrayList<>();

    protected CookbookEntry() {}

    public CookbookEntry(UUID userId, Recipe recipe, Short rating, String memo, Instant cookedAt) {
        this.userId = userId;
        this.recipe = recipe;
        this.rating = rating;
        this.memo = memo;
        this.cookedAt = cookedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.cookedAt == null) this.cookedAt = this.createdAt;
    }

    public void addPhoto(CookbookPhoto photo) {
        this.photos.add(photo);
        photo.setCookbookEntry(this);
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Recipe getRecipe() { return recipe; }
    public Short getRating() { return rating; }
    public String getMemo() { return memo; }
    public Instant getCookedAt() { return cookedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public List<CookbookPhoto> getPhotos() { return photos; }
}
