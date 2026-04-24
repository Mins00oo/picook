package com.picook.domain.admin.ingredient.controller;

import com.picook.domain.admin.ingredient.dto.AdminIngredientRequest;
import com.picook.domain.admin.ingredient.dto.AdminIngredientResponse;
import com.picook.domain.admin.ingredient.dto.IngredientBulkUploadResponse;
import com.picook.domain.admin.ingredient.dto.IngredientStatsResponse;
import com.picook.domain.admin.ingredient.service.AdminIngredientService;
import com.picook.domain.admin.ingredient.service.IngredientBulkUploadService;
import com.picook.domain.admin.ingredient.service.IngredientExportService;
import com.picook.domain.admin.ingredient.service.IngredientStatsService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "[관리자] 재료", description = "재료 CRUD, 엑셀 일괄등록, 아이콘 관리")
@RestController
@RequestMapping("/api/admin/ingredients")
public class AdminIngredientController {

    private final AdminIngredientService adminIngredientService;
    private final IngredientBulkUploadService bulkUploadService;
    private final IngredientExportService exportService;
    private final IngredientStatsService statsService;

    public AdminIngredientController(AdminIngredientService adminIngredientService,
                                     IngredientBulkUploadService bulkUploadService,
                                     IngredientExportService exportService,
                                     IngredientStatsService statsService) {
        this.adminIngredientService = adminIngredientService;
        this.bulkUploadService = bulkUploadService;
        this.exportService = exportService;
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminIngredientResponse>>> getIngredients(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subcategoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean hasSubcategory,
            @RequestParam(required = false) Boolean hasEmoji,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        PageResponse<AdminIngredientResponse> response = adminIngredientService.list(
                categoryId, subcategoryId, keyword, hasSubcategory, hasEmoji, page, size, sort);
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
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun) {
        IngredientBulkUploadResponse response = bulkUploadService.uploadFromExcel(file, dryRun);
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

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subcategoryId,
            @RequestParam(required = false) String keyword) {
        byte[] data = exportService.exportToExcel(categoryId, subcategoryId, keyword);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ingredients-export.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<IngredientStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getStats()));
    }
}
