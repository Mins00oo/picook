package com.picook.domain.fridge.entity;

import com.picook.domain.ingredient.entity.Ingredient;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_fridge_ingredients", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "ingredient_id"})
})
public class UserFridgeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "added_at", updatable = false)
    private Instant addedAt;

    protected UserFridgeIngredient() {}

    public UserFridgeIngredient(UUID userId, Ingredient ingredient) {
        this.userId = userId;
        this.ingredient = ingredient;
    }

    @PrePersist
    protected void onCreate() {
        this.addedAt = Instant.now();
    }

    public Long getId() { return id; }
    public UUID getUserId() { return userId; }
    public Ingredient getIngredient() { return ingredient; }
    public Instant getAddedAt() { return addedAt; }
}
