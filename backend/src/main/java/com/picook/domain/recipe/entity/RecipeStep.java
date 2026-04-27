package com.picook.domain.recipe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recipe_steps")
public class RecipeStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    protected RecipeStep() {}

    public RecipeStep(Recipe recipe, Integer stepNumber, String description, String imageUrl) {
        this.recipe = recipe;
        this.stepNumber = stepNumber;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Integer getId() { return id; }

    public Recipe getRecipe() { return recipe; }

    public Integer getStepNumber() { return stepNumber; }

    public String getDescription() { return description; }

    public String getImageUrl() { return imageUrl; }
}
