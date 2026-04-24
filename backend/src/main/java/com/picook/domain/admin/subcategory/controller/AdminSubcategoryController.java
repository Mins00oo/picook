package com.picook.domain.admin.subcategory.controller;

import com.picook.domain.admin.subcategory.dto.AdminSubcategoryRequest;
import com.picook.domain.admin.subcategory.dto.AdminSubcategoryResponse;
import com.picook.domain.admin.subcategory.dto.ReorderSubcategoryRequest;
import com.picook.domain.admin.subcategory.service.AdminSubcategoryService;
import com.picook.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "[관리자] 서브카테고리", description = "재료 서브카테고리 CRUD")
@RestController
@RequestMapping("/api/admin/subcategories")
public class AdminSubcategoryController {

    private final AdminSubcategoryService service;

    public AdminSubcategoryController(AdminSubcategoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminSubcategoryResponse>>> list(
            @RequestParam(required = false) Integer categoryId) {
        return ResponseEntity.ok(ApiResponse.success(service.list(categoryId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminSubcategoryResponse>> create(
            @Valid @RequestBody AdminSubcategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminSubcategoryResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody AdminSubcategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorder(@Valid @RequestBody ReorderSubcategoryRequest req) {
        service.reorder(req);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
