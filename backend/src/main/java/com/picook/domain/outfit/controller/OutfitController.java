package com.picook.domain.outfit.controller;

import com.picook.domain.outfit.dto.EquipOutfitRequest;
import com.picook.domain.outfit.dto.MyOutfitsResponse;
import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.domain.outfit.dto.PurchaseOutfitRequest;
import com.picook.domain.outfit.service.OutfitService;
import com.picook.domain.outfit.service.ShopService;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "의상/상점", description = "캐릭터 의상 카탈로그, 인벤토리, 장착, 포인트 구매")
@RestController
@RequestMapping("/api/v1/outfits")
public class OutfitController {

    private final OutfitService outfitService;
    private final ShopService shopService;

    public OutfitController(OutfitService outfitService, ShopService shopService) {
        this.outfitService = outfitService;
        this.shopService = shopService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OutfitResponse>>> getCatalog() {
        return ResponseEntity.ok(ApiResponse.success(outfitService.getCatalog(getCurrentUserId())));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MyOutfitsResponse>> getMine() {
        return ResponseEntity.ok(ApiResponse.success(outfitService.getMyOutfits(getCurrentUserId())));
    }

    @PostMapping("/me/purchase")
    public ResponseEntity<ApiResponse<ShopService.PurchaseResult>> purchase(
            @Valid @RequestBody PurchaseOutfitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(shopService.purchase(getCurrentUserId(), request)));
    }

    @PutMapping("/me/equip")
    public ResponseEntity<ApiResponse<MyOutfitsResponse>> equip(
            @Valid @RequestBody EquipOutfitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(outfitService.equip(getCurrentUserId(), request)));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
