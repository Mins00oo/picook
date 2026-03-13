package com.picook.domain.recipe.entity;

public enum StepType {
    ACTIVE("active"),
    WAIT("wait");

    private final String value;

    StepType(String value) {
        this.value = value;
    }

    public String getValue() { return value; }

    public static StepType fromValue(String value) {
        for (StepType t : values()) {
            if (t.value.equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown step type: " + value);
    }
}
