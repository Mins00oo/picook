package com.picook.domain.admin.ingredient.controller;

import com.picook.domain.admin.ingredient.dto.AdminIngredientRequest;
import com.picook.domain.admin.ingredient.dto.AdminIngredientResponse;
import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse;
import com.picook.domain.admin.ingredient.service.AdminIngredientService;
import com.picook.domain.admin.ingredient.service.IngredientBulkUploadService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/ingredients")
public class AdminIngredientController {

    private final AdminIngredientService adminIngredientService;
    private final IngredientBulkUploadService bulkUploadService;

    public AdminIngredientController(AdminIngredientService adminIngredientService,
                                     IngredientBulkUploadService bulkUploadService) {
        this.adminIngredientService = adminIngredientService;
        this.bulkUploadService = bulkUploadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminIngredientResponse>>> getIngredients(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminIngredientResponse> response = adminIngredientService.getIngredients(categoryId, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIngredientResponse>> getIngredient(@PathVariable Integer id) {
        AdminIngredientResponse response = adminIngredientService.getIngredient(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminIngredientResponse>> createIngredient(
            @Valid @RequestBody AdminIngredientRequest request) {
        AdminIngredientResponse response = adminIngredientService.createIngredient(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIngredientResponse>> updateIngredient(
            @PathVariable Integer id,
            @Valid @RequestBody AdminIngredientRequest request) {
        AdminIngredientResponse response = adminIngredientService.updateIngredient(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIngredient(@PathVariable Integer id) {
        adminIngredientService.deleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<ApiResponse<IngredientBulkUploadResponse>> bulkUpload(
            @RequestParam("file") MultipartFile file) {
        IngredientBulkUploadResponse response = bulkUploadService.uploadFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/bulk-template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = bulkUploadService.downloadTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ingredient_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }
}
