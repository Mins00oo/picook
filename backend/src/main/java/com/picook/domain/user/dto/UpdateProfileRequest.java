package com.picook.domain.user.dto;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        String displayName,
        String cookingLevel,
        Boolean coachingEnabled,
        BigDecimal coachingVoiceSpeed,
        Boolean isOnboarded
) {}
