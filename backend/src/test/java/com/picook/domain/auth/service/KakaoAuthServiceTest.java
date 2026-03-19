package com.picook.domain.auth.service;

import com.picook.domain.auth.dto.AuthResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserStatus;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KakaoAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private KakaoAuthService kakaoAuthService;

    @BeforeEach
    void setUp() throws Exception {
        kakaoAuthService = new KakaoAuthService(userRepository, authService,
                WebClient.builder());
        // WebClient를 mock으로 교체
        Field webClientField = KakaoAuthService.class.getDeclaredField("webClient");
        webClientField.setAccessible(true);
        webClientField.set(kakaoAuthService, webClient);
    }

    @Test
    void login_newUser_shouldCreateAndReturnTokens() throws Exception {
        Map<String, Object> profile = Map.of("nickname", "테스터", "profile_image_url", "https://img.kakao.com/test.jpg");
        Map<String, Object> kakaoAccount = Map.of("email", "test@kakao.com", "profile", profile);
        Map<String, Object> kakaoUser = Map.of("id", 12345L, "kakao_account", kakaoAccount);

        setupWebClientMock(kakaoUser);

        User savedUser = new User(LoginType.KAKAO);
        setField(savedUser, "id", UUID.randomUUID());
        savedUser.setKakaoId("12345");
        savedUser.setEmail("test@kakao.com");

        when(userRepository.findByKakaoId("12345")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse mockResponse = new AuthResponse("access", "refresh", null);
        when(authService.createAuthResponse(any(User.class))).thenReturn(mockResponse);

        AuthResponse response = kakaoAuthService.login("kakao-token");

        assertThat(response.accessToken()).isEqualTo("access");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void login_existingUser_shouldReturnTokens() throws Exception {
        Map<String, Object> kakaoUser = Map.of("id", 12345L, "kakao_account",
                Map.of("email", "test@kakao.com", "profile", Map.of("nickname", "테스터")));

        setupWebClientMock(kakaoUser);

        User existingUser = new User(LoginType.KAKAO);
        setField(existingUser, "id", UUID.randomUUID());
        existingUser.setKakaoId("12345");

        when(userRepository.findByKakaoId("12345")).thenReturn(Optional.of(existingUser));

        AuthResponse mockResponse = new AuthResponse("access", "refresh", null);
        when(authService.createAuthResponse(existingUser)).thenReturn(mockResponse);

        AuthResponse response = kakaoAuthService.login("kakao-token");

        assertThat(response.accessToken()).isEqualTo("access");
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_suspendedUser_shouldThrow() throws Exception {
        Map<String, Object> kakaoUser = Map.of("id", 12345L, "kakao_account",
                Map.of("email", "test@kakao.com", "profile", Map.of("nickname", "테스터")));

        setupWebClientMock(kakaoUser);

        User suspendedUser = new User(LoginType.KAKAO);
        setField(suspendedUser, "id", UUID.randomUUID());
        setField(suspendedUser, "status", UserStatus.SUSPENDED);
        suspendedUser.setSuspendedReason("규정 위반");

        when(userRepository.findByKakaoId("12345")).thenReturn(Optional.of(suspendedUser));

        assertThatThrownBy(() -> kakaoAuthService.login("kakao-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("정지된 계정");
    }

    @Test
    void login_deletedUser_shouldThrow() throws Exception {
        Map<String, Object> kakaoUser = Map.of("id", 12345L, "kakao_account",
                Map.of("email", "test@kakao.com", "profile", Map.of("nickname", "테스터")));

        setupWebClientMock(kakaoUser);

        User deletedUser = new User(LoginType.KAKAO);
        setField(deletedUser, "id", UUID.randomUUID());
        setField(deletedUser, "status", UserStatus.DELETED);

        when(userRepository.findByKakaoId("12345")).thenReturn(Optional.of(deletedUser));

        assertThatThrownBy(() -> kakaoAuthService.login("kakao-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("탈퇴된 계정");
    }

    @Test
    void login_kakaoApiFailed_shouldThrow() {
        when(webClient.get()).thenThrow(new RuntimeException("Connection refused"));

        assertThatThrownBy(() -> kakaoAuthService.login("invalid-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Failed to verify Kakao token");
    }

    @SuppressWarnings("unchecked")
    private void setupWebClientMock(Map<String, Object> response) {
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(response));
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
