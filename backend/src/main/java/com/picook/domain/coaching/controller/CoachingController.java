package com.picook.domain.coaching.controller;

import com.picook.domain.coaching.dto.*;
import com.picook.domain.coaching.service.CoachingService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Tag(name = "코칭", description = "코칭 시작/완료, 사진 업로드")
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

    /** 다중 사진 업로드 (최대 5장) */
    @PostMapping("/{id}/photos")
    public ResponseEntity<ApiResponse<PhotoUploadResponse>> uploadPhotos(
            @PathVariable Integer id,
            @RequestParam("files") List<MultipartFile> files) {
        PhotoUploadResponse response = coachingService.uploadCoachingPhotos(getCurrentUserId(), id, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /** 기존 단일 사진 업로드 (하위 호환) — 내부에서 photos로 위임 */
    @PostMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<PhotoUploadResponse>> uploadPhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        PhotoUploadResponse response = coachingService.uploadCoachingPhotos(getCurrentUserId(), id, List.of(file));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /** 사진 삭제 */
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Integer photoId) {
        coachingService.deleteCoachingPhoto(getCurrentUserId(), photoId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
