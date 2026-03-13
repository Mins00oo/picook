package com.picook.domain.favorite.entity;

import com.picook.domain.recipe.entity.Recipe;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "recipe_id"})
})
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected Favorite() {}

    public Favorite(UUID userId, Recipe recipe) {
        this.userId = userId;
        this.recipe = recipe;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public UUID getUserId() { return userId; }
    public Recipe getRecipe() { return recipe; }
    public Instant getCreatedAt() { return createdAt; }
}
