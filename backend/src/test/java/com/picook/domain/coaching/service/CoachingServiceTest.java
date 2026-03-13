package com.picook.domain.coaching.service;

import com.picook.domain.coaching.dto.*;
import com.picook.domain.coaching.entity.CoachingLog;
import com.picook.domain.coaching.entity.CookingCompletion;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.coaching.repository.CookingCompletionRepository;
import com.picook.domain.file.dto.FileUploadResponse;
import com.picook.domain.file.service.S3FileService;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoachingServiceTest {

    @Mock private CoachingLogRepository coachingLogRepository;
    @Mock private CookingCompletionRepository cookingCompletionRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private UserRepository userRepository;
    @Mock private S3FileService s3FileService;

    private CoachingService coachingService;
    private UUID userId;
    private Recipe recipe;

    @BeforeEach
    void setUp() throws Exception {
        coachingService = new CoachingService(
                coachingLogRepository, cookingCompletionRepository,
                recipeRepository, userRepository, s3FileService);
        userId = UUID.randomUUID();
        recipe = new Recipe("김치찌개", "한식", "easy", 30, 2);
        setField(recipe, "id", 1);
        setField(recipe, "coachingReady", true);
    }

    @Test
    void 코칭_시작_싱글_성공() {
        StartCoachingRequest request = new StartCoachingRequest("single", List.of(1), 1800);
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));
        when(coachingLogRepository.save(any(CoachingLog.class))).thenAnswer(inv -> inv.getArgument(0));

        CoachingLogResponse response = coachingService.startCoaching(userId, request);

        assertThat(response.mode()).isEqualTo("single");
        assertThat(response.recipeIds()).containsExactly(1);
        assertThat(response.completed()).isFalse();
        verify(coachingLogRepository).save(any(CoachingLog.class));
    }

    @Test
    void 코칭_시작_멀티_성공() throws Exception {
        Recipe recipe2 = new Recipe("된장찌개", "한식", "easy", 25, 2);
        setField(recipe2, "id", 2);
        setField(recipe2, "coachingReady", true);

        StartCoachingRequest request = new StartCoachingRequest("multi", List.of(1, 2), 3600);
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));
        when(recipeRepository.findByIdAndIsDeletedFalse(2)).thenReturn(Optional.of(recipe2));
        when(coachingLogRepository.save(any(CoachingLog.class))).thenAnswer(inv -> inv.getArgument(0));

        CoachingLogResponse response = coachingService.startCoaching(userId, request);

        assertThat(response.mode()).isEqualTo("multi");
        assertThat(response.recipeIds()).containsExactly(1, 2);
    }

    @Test
    void 코칭_시작_싱글모드_레시피_2개이면_에러() {
        StartCoachingRequest request = new StartCoachingRequest("single", List.of(1, 2), 1800);

        assertThatThrownBy(() -> coachingService.startCoaching(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("싱글 모드에서는 레시피 1개");
    }

    @Test
    void 코칭_시작_멀티모드_레시피_1개이면_에러() {
        StartCoachingRequest request = new StartCoachingRequest("multi", List.of(1), 1800);

        assertThatThrownBy(() -> coachingService.startCoaching(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("멀티 모드에서는 레시피 2개");
    }

    @Test
    void 코칭_시작_잘못된_모드_에러() {
        StartCoachingRequest request = new StartCoachingRequest("invalid", List.of(1), 1800);

        assertThatThrownBy(() -> coachingService.startCoaching(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("single 또는 multi");
    }

    @Test
    void 코칭_시작_미존재_레시피_에러() {
        StartCoachingRequest request = new StartCoachingRequest("single", List.of(999), 1800);
        when(recipeRepository.findByIdAndIsDeletedFalse(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> coachingService.startCoaching(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("레시피를 찾을 수 없습니다");
    }

    @Test
    void 코칭_시작_코칭미지원_레시피_에러() throws Exception {
        setField(recipe, "coachingReady", false);
        StartCoachingRequest request = new StartCoachingRequest("single", List.of(1), 1800);
        when(recipeRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(recipe));

        assertThatThrownBy(() -> coachingService.startCoaching(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("코칭이 지원되지 않는 레시피");
    }

    @Test
    void 코칭_완료_성공() throws Exception {
        CoachingLog log = new CoachingLog(userId, "single", List.of(1), 1800);
        setField(log, "id", 1);
        setField(log, "startedAt", java.time.Instant.now());

        when(coachingLogRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(log));
        when(coachingLogRepository.save(any(CoachingLog.class))).thenAnswer(inv -> inv.getArgument(0));

        CompleteCoachingRequest request = new CompleteCoachingRequest(2000);
        CoachingLogResponse response = coachingService.completeCoaching(userId, 1, request);

        assertThat(response.completed()).isTrue();
        assertThat(response.actualSeconds()).isEqualTo(2000);
    }

    @Test
    void 코칭_이미_완료된_세션_재완료_에러() throws Exception {
        CoachingLog log = new CoachingLog(userId, "single", List.of(1), 1800);
        setField(log, "id", 1);
        log.complete(2000);

        when(coachingLogRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(log));

        CompleteCoachingRequest request = new CompleteCoachingRequest(2500);
        assertThatThrownBy(() -> coachingService.completeCoaching(userId, 1, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 완료된 코칭 세션");
    }

    @Test
    void 코칭_타인_세션_완료_방지() {
        UUID otherUserId = UUID.randomUUID();
        when(coachingLogRepository.findByIdAndUserId(1, otherUserId)).thenReturn(Optional.empty());

        CompleteCoachingRequest request = new CompleteCoachingRequest(2000);
        assertThatThrownBy(() -> coachingService.completeCoaching(otherUserId, 1, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("코칭 세션을 찾을 수 없습니다");
    }

    @Test
    void 사진_업로드_성공_등급_포함() throws Exception {
        CoachingLog log = new CoachingLog(userId, "single", List.of(1), 1800);
        setField(log, "id", 1);
        log.complete(2000);

        User user = new User(LoginType.KAKAO);
        setField(user, "id", userId);
        setField(user, "completedCookingCount", 5);

        MultipartFile mockFile = mock(MultipartFile.class);

        when(coachingLogRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(log));
        when(cookingCompletionRepository.existsByCoachingLogId(1)).thenReturn(false);
        when(s3FileService.upload(mockFile)).thenReturn(new FileUploadResponse("https://s3.com/photo.jpg", "photo.jpg", 1024));
        when(cookingCompletionRepository.save(any(CookingCompletion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        CookingCompletionResponse response = coachingService.uploadCompletionPhoto(userId, 1, mockFile);

        assertThat(response.photoUrl()).isEqualTo("https://s3.com/photo.jpg");
        assertThat(response.recipeId()).isEqualTo(1);
        assertThat(response.rankInfo()).isNotNull();
        assertThat(response.rankInfo().level()).isEqualTo(3); // count 5+1=6 -> LV3
        verify(cookingCompletionRepository).save(any(CookingCompletion.class));
    }

    @Test
    void 사진_업로드_미완료_코칭_에러() throws Exception {
        CoachingLog log = new CoachingLog(userId, "single", List.of(1), 1800);
        setField(log, "id", 1);

        MultipartFile mockFile = mock(MultipartFile.class);
        when(coachingLogRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(log));

        assertThatThrownBy(() -> coachingService.uploadCompletionPhoto(userId, 1, mockFile))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("코칭이 아직 완료되지 않았습니다");
    }

    @Test
    void 사진_중복_업로드_방지() throws Exception {
        CoachingLog log = new CoachingLog(userId, "single", List.of(1), 1800);
        setField(log, "id", 1);
        log.complete(2000);

        MultipartFile mockFile = mock(MultipartFile.class);
        when(coachingLogRepository.findByIdAndUserId(1, userId)).thenReturn(Optional.of(log));
        when(cookingCompletionRepository.existsByCoachingLogId(1)).thenReturn(true);

        assertThatThrownBy(() -> coachingService.uploadCompletionPhoto(userId, 1, mockFile))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("이미 완성 사진이 등록된");
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
