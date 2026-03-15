package com.picook.domain.user.controller;

import com.picook.domain.user.dto.UpdateProfileRequest;
import com.picook.domain.user.dto.UserProfileResponse;
import com.picook.domain.user.service.UserService;
import com.picook.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        UserProfileResponse response = userService.getProfile(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        userService.deleteAccount(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private UUID getCurrentUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
