package com.picook.domain.feedback.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FeedbackStatus {
    PENDING("pending"),
    REVIEWED("reviewed"),
    RESOLVED("resolved");

    private final String value;

    FeedbackStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }

    public static FeedbackStatus fromValue(String value) {
        for (FeedbackStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
