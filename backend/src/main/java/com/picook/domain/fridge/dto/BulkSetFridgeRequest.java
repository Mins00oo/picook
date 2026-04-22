package com.picook.domain.fridge.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkSetFridgeRequest(
        @NotNull List<Integer> ingredientIds
) {}
