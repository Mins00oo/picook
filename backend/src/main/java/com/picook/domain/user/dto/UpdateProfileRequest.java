package com.picook.domain.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 10) String displayName,

        /** MIN / ROO / HARU */
        @Pattern(regexp = "^(MIN|ROO|HARU)$",
                 message = "characterType은 MIN/ROO/HARU 중 하나여야 합니다")
        String characterType
) {}
