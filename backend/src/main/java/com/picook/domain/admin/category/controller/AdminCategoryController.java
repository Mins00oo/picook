package com.picook.domain.admin.category.controller;

import com.picook.domain.admin.category.dto.AdminCategoryRequest;
import com.picook.domain.admin.category.dto.AdminCategoryResponse;
import com.picook.domain.admin.category.dto.CategoryReorderRequest;
import com.picook.domain.admin.category.service.AdminCategoryService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    public AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminCategoryResponse>>> getAllCategories() {
        List<AdminCategoryResponse> response = adminCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> createCategory(
            @Valid @RequestBody AdminCategoryRequest request) {
        AdminCategoryResponse response = adminCategoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody AdminCategoryRequest request) {
        AdminCategoryResponse response = adminCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        adminCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderCategories(
            @Valid @RequestBody CategoryReorderRequest request) {
        adminCategoryService.reorderCategories(request);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
