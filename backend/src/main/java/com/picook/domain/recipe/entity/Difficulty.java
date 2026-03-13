package com.picook.domain.recipe.entity;

public enum Difficulty {
    EASY("easy"),
    MEDIUM("medium"),
    HARD("hard");

    private final String value;

    Difficulty(String value) {
        this.value = value;
    }

    public String getValue() { return value; }

    public static Difficulty fromValue(String value) {
        for (Difficulty d : values()) {
            if (d.value.equalsIgnoreCase(value)) return d;
        }
        throw new IllegalArgumentException("Unknown difficulty: " + value);
    }
}
