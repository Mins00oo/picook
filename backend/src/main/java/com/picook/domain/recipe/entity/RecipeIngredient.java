package com.picook.domain.recipe.entity;

import com.picook.domain.ingredient.entity.Ingredient;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredients")
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "is_required")
    private Boolean isRequired = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    protected RecipeIngredient() {}

    public RecipeIngredient(Recipe recipe, Ingredient ingredient, BigDecimal amount, String unit, Boolean isRequired, Integer sortOrder) {
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.amount = amount;
        this.unit = unit;
        this.isRequired = isRequired != null ? isRequired : true;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    // Getters

    public Integer getId() { return id; }

    public Recipe getRecipe() { return recipe; }

    public Ingredient getIngredient() { return ingredient; }

    public BigDecimal getAmount() { return amount; }

    public String getUnit() { return unit; }

    public Boolean getIsRequired() { return isRequired; }

    public Integer getSortOrder() { return sortOrder; }
}
