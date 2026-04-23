package com.picook.domain.cookbook.controller;

import com.picook.domain.cookbook.dto.CookbookEntryResponse;
import com.picook.domain.cookbook.dto.CookbookStatsResponse;
import com.picook.domain.cookbook.dto.CreateCookbookEntryRequest;
import com.picook.domain.cookbook.service.CookbookService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Tag(name = "요리북", description = "요리 완료 후 평가(별점/사진/메모) 등록 및 내역")
@RestController
@RequestMapping("/api/v1/cookbook")
public class CookbookController {

    private final CookbookService cookbookService;

    public CookbookController(CookbookService cookbookService) {
        this.cookbookService = cookbookService;
    }

    @PostMapping(value = "/entries", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CookbookEntryResponse>> create(
            @Valid @ModelAttribute CreateCookbookEntryRequest request,
            @RequestPart(value = "photos", required = false) MultipartFile[] photos) {
        CookbookEntryResponse response = cookbookService.create(getCurrentUserId(), request, photos);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/entries")
    public ResponseEntity<ApiResponse<PageResponse<CookbookEntryResponse>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(cookbookService.list(getCurrentUserId(), pageable)));
    }

    @GetMapping("/entries/{id}")
    public ResponseEntity<ApiResponse<CookbookEntryResponse>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cookbookService.getDetail(getCurrentUserId(), id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CookbookStatsResponse>> getStats(
            @RequestParam(value = "yearMonth", required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(cookbookService.getStats(getCurrentUserId(), yearMonth)));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
