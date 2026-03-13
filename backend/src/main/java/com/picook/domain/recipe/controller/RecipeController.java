package com.picook.domain.recipe.controller;

import com.picook.domain.recipe.dto.RecipeDetailResponse;
import com.picook.domain.recipe.dto.RecommendRequest;
import com.picook.domain.recipe.dto.RecommendResponse;
import com.picook.domain.recipe.service.RecipeService;
import com.picook.domain.recipe.service.RecommendService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecommendService recommendService;
    private final RecipeService recipeService;

    public RecipeController(RecommendService recommendService, RecipeService recipeService) {
        this.recommendService = recommendService;
        this.recipeService = recipeService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<List<RecommendResponse>>> recommend(
            @Valid @RequestBody RecommendRequest request) {
        List<RecommendResponse> responses = recommendService.recommend(request);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> getRecipeDetail(@PathVariable Integer id) {
        RecipeDetailResponse response = recipeService.getRecipeDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
