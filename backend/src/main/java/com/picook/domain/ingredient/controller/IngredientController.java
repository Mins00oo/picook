package com.picook.domain.ingredient.controller;

import com.picook.domain.ingredient.dto.CategoryResponse;
import com.picook.domain.ingredient.dto.IngredientResponse;
import com.picook.domain.ingredient.service.IngredientService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getAllIngredients() {
        List<IngredientResponse> ingredients = ingredientService.getAllIngredients();
        return ResponseEntity.ok(ApiResponse.success(ingredients));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> categories = ingredientService.getCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
