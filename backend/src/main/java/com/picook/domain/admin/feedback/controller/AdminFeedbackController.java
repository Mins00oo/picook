package com.picook.domain.admin.feedback.controller;

import com.picook.domain.admin.feedback.dto.*;
import com.picook.domain.admin.feedback.service.AdminFeedbackService;
import com.picook.global.response.ApiResponse;
import com.picook.global.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/feedback")
public class AdminFeedbackController {

    private final AdminFeedbackService adminFeedbackService;

    public AdminFeedbackController(AdminFeedbackService adminFeedbackService) {
        this.adminFeedbackService = adminFeedbackService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminFeedbackListResponse>>> getFeedbackList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) Integer recipeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminFeedbackListResponse> response = adminFeedbackService.getFeedbackList(
                status, rating, recipeId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminFeedbackDetailResponse>> getFeedback(@PathVariable Integer id) {
        AdminFeedbackDetailResponse response = adminFeedbackService.getFeedback(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> changeStatus(
            @PathVariable Integer id,
            @Valid @RequestBody AdminFeedbackStatusRequest request) {
        adminFeedbackService.changeStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<ApiResponse<Void>> updateNote(
            @PathVariable Integer id,
            @Valid @RequestBody AdminFeedbackNoteRequest request) {
        adminFeedbackService.updateNote(id, request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminFeedbackSummaryResponse>> getSummary() {
        AdminFeedbackSummaryResponse response = adminFeedbackService.getSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
