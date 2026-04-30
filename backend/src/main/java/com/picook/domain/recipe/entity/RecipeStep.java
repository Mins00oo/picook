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

    /** 조리 팁 / 주의사항 (V25 신설). UI에서 💡 아이콘으로 별도 표시 가능. */
    @Column(name = "tip", columnDefinition = "TEXT")
    private String tip;

    protected RecipeStep() {}

    public RecipeStep(Recipe recipe, Integer stepNumber, String description, String imageUrl) {
        this(recipe, stepNumber, description, imageUrl, null);
    }

    public RecipeStep(Recipe recipe, Integer stepNumber, String description, String imageUrl, String tip) {
        this.recipe = recipe;
        this.stepNumber = stepNumber;
        this.description = description;
        this.imageUrl = imageUrl;
        this.tip = tip;
    }

    public Integer getId() { return id; }

    public Recipe getRecipe() { return recipe; }

    public Integer getStepNumber() { return stepNumber; }

    public String getDescription() { return description; }

    public String getImageUrl() { return imageUrl; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }
}
