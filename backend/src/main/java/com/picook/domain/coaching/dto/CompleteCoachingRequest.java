package com.picook.domain.coaching.dto;

import jakarta.validation.constraints.NotNull;

public record CompleteCoachingRequest(
        @NotNull Integer actualSeconds
) {}
