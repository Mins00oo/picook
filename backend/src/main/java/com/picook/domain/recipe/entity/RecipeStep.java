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

    @Column(name = "step_type", nullable = false, length = 10)
    private String stepType = "active";

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "can_parallel")
    private Boolean canParallel = true;

    protected RecipeStep() {}

    public RecipeStep(Recipe recipe, Integer stepNumber, String description, String imageUrl,
                      String stepType, Integer durationSeconds, Boolean canParallel) {
        this.recipe = recipe;
        this.stepNumber = stepNumber;
        this.description = description;
        this.imageUrl = imageUrl;
        this.stepType = stepType != null ? stepType : "active";
        this.durationSeconds = durationSeconds;
        this.canParallel = canParallel != null ? canParallel : true;
    }

    // Getters

    public Integer getId() { return id; }

    public Recipe getRecipe() { return recipe; }

    public Integer getStepNumber() { return stepNumber; }

    public String getDescription() { return description; }

    public String getImageUrl() { return imageUrl; }

    public String getStepType() { return stepType; }

    public Integer getDurationSeconds() { return durationSeconds; }

    public Boolean getCanParallel() { return canParallel; }
}
