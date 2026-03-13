package com.picook.domain.coaching.controller;

import com.picook.domain.coaching.dto.*;
import com.picook.domain.coaching.service.CoachingService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coaching")
public class CoachingController {

    private final CoachingService coachingService;

    public CoachingController(CoachingService coachingService) {
        this.coachingService = coachingService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<CoachingLogResponse>> start(
            @Valid @RequestBody StartCoachingRequest request) {
        CoachingLogResponse response = coachingService.startCoaching(getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<CoachingLogResponse>> complete(
            @PathVariable Integer id,
            @Valid @RequestBody CompleteCoachingRequest request) {
        CoachingLogResponse response = coachingService.completeCoaching(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<CookingCompletionResponse>> uploadPhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        CookingCompletionResponse response = coachingService.uploadCompletionPhoto(getCurrentUserId(), id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
