package com.picook.domain.favorite.controller;

import com.picook.domain.favorite.dto.AddFavoriteRequest;
import com.picook.domain.favorite.dto.FavoriteResponse;
import com.picook.domain.favorite.service.FavoriteService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "즐겨찾기", description = "즐겨찾기 추가/삭제/목록")
@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getFavorites() {
        List<FavoriteResponse> responses = favoriteService.getFavorites(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(
            @Valid @RequestBody AddFavoriteRequest request) {
        FavoriteResponse response = favoriteService.addFavorite(getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFavorite(@PathVariable Integer id) {
        favoriteService.deleteFavorite(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
