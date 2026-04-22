package com.picook.domain.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 10) String displayName,

        /** EGG / POTATO / CARROT */
        @Pattern(regexp = "^(EGG|POTATO|CARROT)$",
                 message = "characterType은 EGG/POTATO/CARROT 중 하나여야 합니다")
        String characterType
) {}
