package com.picook.domain.user.service;

import com.picook.domain.user.dto.UserProfileResponse;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
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

    private UserService userService;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
        userId = UUID.randomUUID();
    }

    @Test
    void 프로필_조회_성공_등급_포함() throws Exception {
        User user = new User(LoginType.KAKAO);
        setField(user, "id", userId);
        setField(user, "email", "test@test.com");
        setField(user, "displayName", "테스트");
        setField(user, "completedCookingCount", 10);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile(userId);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.rank()).isNotNull();
        assertThat(response.rank().level()).isEqualTo(3); // count 10 -> LV3
        assertThat(response.rank().title()).isEqualTo("집밥 요리사");
        assertThat(response.rank().nextLevelAt()).isEqualTo(11);
    }

    @Test
    void 미존재_사용자_프로필_조회_에러() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile(userId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사용자를 찾을 수 없습니다");
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
