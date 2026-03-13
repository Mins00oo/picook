package com.picook.domain.recipe.entity;

public enum RecipeStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    HIDDEN("hidden");

    private final String value;

    RecipeStatus(String value) {
        this.value = value;
    }

    public String getValue() { return value; }

    public static RecipeStatus fromValue(String value) {
        for (RecipeStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
