package com.picook.domain.admin.outfit.controller;

import com.picook.domain.admin.outfit.service.AdminOutfitService;
import com.picook.domain.outfit.dto.AdminOutfitRequest;
import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "관리자 의상", description = "의상 카탈로그 CRUD (백오피스)")
@RestController
@RequestMapping("/api/admin/outfits")
public class AdminOutfitController {

    private final AdminOutfitService adminOutfitService;

    public AdminOutfitController(AdminOutfitService adminOutfitService) {
        this.adminOutfitService = adminOutfitService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OutfitResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(adminOutfitService.list()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OutfitResponse>> create(
            @Valid @RequestBody AdminOutfitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminOutfitService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OutfitResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminOutfitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminOutfitService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        adminOutfitService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
