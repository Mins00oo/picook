package com.picook.domain.fridge.controller;

import com.picook.domain.fridge.dto.BulkSetFridgeRequest;
import com.picook.domain.fridge.dto.FridgeIngredientResponse;
import com.picook.domain.fridge.service.FridgeService;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "내 냉장고", description = "사용자별 보유 재료(이진값) 관리")
@RestController
@RequestMapping("/api/v1/fridge")
public class FridgeController {

    private final FridgeService fridgeService;

    public FridgeController(FridgeService fridgeService) {
        this.fridgeService = fridgeService;
    }

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<List<FridgeIngredientResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(fridgeService.list(getCurrentUserId())));
    }

    @PostMapping("/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<FridgeIngredientResponse>> add(
            @PathVariable Integer ingredientId) {
        FridgeIngredientResponse response = fridgeService.add(getCurrentUserId(), ingredientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Integer ingredientId) {
        fridgeService.remove(getCurrentUserId(), ingredientId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PutMapping("/ingredients")
    public ResponseEntity<ApiResponse<List<FridgeIngredientResponse>>> bulkSet(
            @Valid @RequestBody BulkSetFridgeRequest request) {
        List<FridgeIngredientResponse> result = fridgeService.bulkSet(
                getCurrentUserId(), request.ingredientIds());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
