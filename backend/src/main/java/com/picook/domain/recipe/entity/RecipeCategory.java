package com.picook.domain.recipe.entity;

public enum RecipeCategory {
    KOREAN("korean"),
    WESTERN("western"),
    CHINESE("chinese"),
    JAPANESE("japanese"),
    SNACK("snack"),
    DESSERT("dessert"),
    DRINK("drink"),
    OTHER("other");

    private final String value;

    RecipeCategory(String value) {
        this.value = value;
    }

    public String getValue() { return value; }

    public static RecipeCategory fromValue(String value) {
        for (RecipeCategory c : values()) {
            if (c.value.equalsIgnoreCase(value)) return c;
        }
        throw new IllegalArgumentException("Unknown category: " + value);
    }
}
