package com.picook.domain.ingredient.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ingredient_synonyms")
public class IngredientSynonym {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "synonym", nullable = false, length = 100)
    private String synonym;

    protected IngredientSynonym() {}

    public IngredientSynonym(Ingredient ingredient, String synonym) {
        this.ingredient = ingredient;
        this.synonym = synonym;
    }

    // Getters

    public Integer getId() { return id; }

    public Ingredient getIngredient() { return ingredient; }

    public String getSynonym() { return synonym; }
}
