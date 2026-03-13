package com.picook.domain.feedback.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FeedbackRating {
    DELICIOUS("delicious"),
    OKAY("okay"),
    DIFFICULT("difficult");

    private final String value;

    FeedbackRating(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }

    public static FeedbackRating fromValue(String value) {
        for (FeedbackRating r : values()) {
            if (r.value.equalsIgnoreCase(value)) return r;
        }
        throw new IllegalArgumentException("Unknown rating: " + value);
    }
}
