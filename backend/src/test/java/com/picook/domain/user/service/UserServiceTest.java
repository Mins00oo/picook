package com.picook.domain.user.service;

import com.picook.domain.user.dto.UpdateProfileRequest;
import com.picook.domain.user.dto.UserProfileResponse;
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

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserLevelService userLevelService;

    private UserService userService;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, userLevelService);
        userId = UUID.randomUUID();
    }

    @Test
    void 프로필_조회_성공_등급_포함() throws Exception {
        // EXP 500 → LV3 (임계치 480)
        User user = createUser(10, 500L);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile(userId);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.rank()).isNotNull();
        assertThat(response.rank().level()).isEqualTo(3);
        assertThat(response.totalExp()).isEqualTo(500L);
    }

    @Test
    void 미존재_사용자_프로필_조회_에러() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile(userId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사용자를 찾을 수 없습니다");
    }

    @Test
    void 프로필_수정_성공() throws Exception {
        User user = createUser(0, 0L);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("새이름", "EGG");

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertThat(response.displayName()).isEqualTo("새이름");
        assertThat(response.characterType()).isEqualTo("EGG");
    }

    @Test
    void 프로필_수정_닉네임_중복이면_예외() throws Exception {
        User user = createUser(0, 0L);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.existsByDisplayName("중복닉")).thenReturn(true);

        UpdateProfileRequest request = new UpdateProfileRequest("중복닉", null);

        assertThatThrownBy(() -> userService.updateProfile(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 사용 중인 닉네임");
    }

    @Test
    void 프로필_수정_동일_닉네임_재저장은_중복검사_스킵() throws Exception {
        User user = createUser(0, 0L);
        user.setDisplayName("기존닉");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("기존닉", null);

        UserProfileResponse response = userService.updateProfile(userId, request);
        assertThat(response.displayName()).isEqualTo("기존닉");
    }

    @Test
    void 프로필_수정_일부_필드만() throws Exception {
        User user = createUser(0, 0L);
        user.setCharacterType("POTATO");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("새이름만", null);

        UserProfileResponse response = userService.updateProfile(userId, request);

        assertThat(response.displayName()).isEqualTo("새이름만");
        assertThat(response.characterType()).isEqualTo("POTATO");
    }

    @Test
    void 계정_삭제_소프트삭제() throws Exception {
        User user = createUser(0, 0L);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteAccount(userId);

        assertThat(user.getStatus()).isEqualTo(UserStatus.DELETED);
        assertThat(user.getDeletedAt()).isNotNull();
    }

    @Test
    void 탈퇴한_사용자_프로필_조회_에러() throws Exception {
        User user = createUser(0, 0L);
        user.setStatus(UserStatus.DELETED);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.getProfile(userId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("탈퇴한 사용자");
    }

    private User createUser(int completedCookingCount, long totalExp) throws Exception {
        User user = new User(LoginType.KAKAO);
        setField(user, "id", userId);
        setField(user, "email", "test@test.com");
        setField(user, "displayName", "테스트");
        setField(user, "completedCookingCount", completedCookingCount);
        setField(user, "totalExp", totalExp);
        return user;
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
