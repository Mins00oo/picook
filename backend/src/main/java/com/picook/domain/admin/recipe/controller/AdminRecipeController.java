package com.picook.domain.admin.recipe.controller;

import com.picook.domain.admin.recipe.dto.*;
import com.picook.domain.admin.recipe.service.AdminRecipeService;
import com.picook.domain.admin.recipe.service.RecipeBulkUploadService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "[관리자] 레시피", description = "레시피 CRUD, 엑셀 일괄등록, 이미지 관리")
@RestController
@RequestMapping("/api/admin/recipes")
public class AdminRecipeController {

    private final AdminRecipeService adminRecipeService;
    private final RecipeBulkUploadService bulkUploadService;

    public AdminRecipeController(AdminRecipeService adminRecipeService,
                                 RecipeBulkUploadService bulkUploadService) {
        this.adminRecipeService = adminRecipeService;
        this.bulkUploadService = bulkUploadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminRecipeListResponse>>> getRecipes(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        PageResponse<AdminRecipeListResponse> response = adminRecipeService.getRecipes(
                status, category, difficulty, keyword, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRecipeResponse>> getRecipe(@PathVariable Integer id) {
        AdminRecipeResponse response = adminRecipeService.getRecipe(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminRecipeResponse>> createRecipe(
            @Valid @RequestBody AdminRecipeRequest request) {
        AdminRecipeResponse response = adminRecipeService.createRecipe(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRecipeResponse>> updateRecipe(
            @PathVariable Integer id,
            @Valid @RequestBody AdminRecipeRequest request) {
        AdminRecipeResponse response = adminRecipeService.updateRecipe(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(@PathVariable Integer id) {
        adminRecipeService.deleteRecipe(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminRecipeResponse>> changeStatus(
            @PathVariable Integer id,
            @Valid @RequestBody RecipeStatusRequest request) {
        AdminRecipeResponse response = adminRecipeService.changeStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<ApiResponse<RecipeBulkUploadResponse>> bulkUpload(
            @RequestParam("file") MultipartFile file) {
        RecipeBulkUploadResponse response = bulkUploadService.uploadFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/bulk-template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = bulkUploadService.downloadTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=recipe_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }
}
