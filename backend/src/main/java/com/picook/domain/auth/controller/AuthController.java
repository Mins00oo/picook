package com.picook.domain.auth.controller;

import com.picook.domain.auth.dto.*;
import com.picook.domain.auth.service.AppleAuthService;
import com.picook.domain.auth.service.AuthService;
import com.picook.domain.auth.service.KakaoAuthService;
import com.picook.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;
    private final AppleAuthService appleAuthService;

    public AuthController(AuthService authService,
                          KakaoAuthService kakaoAuthService,
                          AppleAuthService appleAuthService) {
        this.authService = authService;
        this.kakaoAuthService = kakaoAuthService;
        this.appleAuthService = appleAuthService;
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/kakao")
    public ResponseEntity<ApiResponse<AuthResponse>> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        AuthResponse response = kakaoAuthService.login(request.accessToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/apple")
    public ResponseEntity<ApiResponse<AuthResponse>> appleLogin(@Valid @RequestBody AppleLoginRequest request) {
        AuthResponse response = appleAuthService.login(request.identityToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
