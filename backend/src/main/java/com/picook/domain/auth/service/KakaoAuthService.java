package com.picook.domain.auth.service;

import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;

@Service
public class KakaoAuthService {

    private static final Logger log = LoggerFactory.getLogger(KakaoAuthService.class);
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

    private final UserRepository userRepository;
    private final AuthService authService;
    private final WebClient webClient;

    public KakaoAuthService(UserRepository userRepository,
                            AuthService authService,
                            WebClient.Builder webClientBuilder) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.webClient = webClientBuilder.build();
    }

    @Transactional
    public AuthResponse login(String kakaoAccessToken) {
        Map<String, Object> kakaoUser = fetchKakaoUser(kakaoAccessToken);

        String kakaoId = String.valueOf(kakaoUser.get("id"));
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoUser.get("kakao_account");
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = kakaoAccount != null
                ? (Map<String, Object>) kakaoAccount.get("profile")
                : null;

        String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        String nickname = profile != null ? (String) profile.get("nickname") : null;
        String profileImage = profile != null ? (String) profile.get("profile_image_url") : null;

        User user = userRepository.findByKakaoId(kakaoId)
                .map(existingUser -> {
                    existingUser.setLastLoginAt(Instant.now());
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User(LoginType.KAKAO);
                    newUser.setKakaoId(kakaoId);
                    newUser.setEmail(email);
                    newUser.setDisplayName(nickname);
                    newUser.setProfileImageUrl(profileImage);
                    newUser.setLastLoginAt(Instant.now());
                    return userRepository.save(newUser);
                });

        return authService.createAuthResponse(user);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchKakaoUser(String accessToken) {
        try {
            return webClient.get()
                    .uri(KAKAO_USER_INFO_URL)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch Kakao user info", e);
            throw new BusinessException("KAKAO_AUTH_FAILED", "Failed to verify Kakao token", HttpStatus.UNAUTHORIZED);
        }
    }
}
