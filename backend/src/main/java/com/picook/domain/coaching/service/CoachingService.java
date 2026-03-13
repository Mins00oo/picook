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
import com.picook.domain.user.dto.RankInfo;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CoachingService {

    private final CoachingLogRepository coachingLogRepository;
    private final CookingCompletionRepository cookingCompletionRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final S3FileService s3FileService;

    public CoachingService(CoachingLogRepository coachingLogRepository,
                           CookingCompletionRepository cookingCompletionRepository,
                           RecipeRepository recipeRepository,
                           UserRepository userRepository,
                           S3FileService s3FileService) {
        this.coachingLogRepository = coachingLogRepository;
        this.cookingCompletionRepository = cookingCompletionRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.s3FileService = s3FileService;
    }

    @Transactional
    public CoachingLogResponse startCoaching(UUID userId, StartCoachingRequest request) {
        validateMode(request.mode(), request.recipeIds());
        validateRecipes(request.recipeIds());

        CoachingLog log = new CoachingLog(userId, request.mode(), request.recipeIds(), request.estimatedSeconds());
        coachingLogRepository.save(log);

        return CoachingLogResponse.of(log);
    }

    @Transactional
    public CoachingLogResponse completeCoaching(UUID userId, Integer coachingLogId, CompleteCoachingRequest request) {
        CoachingLog log = coachingLogRepository.findByIdAndUserId(coachingLogId, userId)
                .orElseThrow(() -> new BusinessException("COACHING_NOT_FOUND", "코칭 세션을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (log.getCompleted()) {
            throw new BusinessException("COACHING_ALREADY_COMPLETED", "이미 완료된 코칭 세션입니다", HttpStatus.BAD_REQUEST);
        }

        log.complete(request.actualSeconds());
        coachingLogRepository.save(log);

        return CoachingLogResponse.of(log);
    }

    @Transactional
    public CookingCompletionResponse uploadCompletionPhoto(UUID userId, Integer coachingLogId, MultipartFile file) {
        CoachingLog log = coachingLogRepository.findByIdAndUserId(coachingLogId, userId)
                .orElseThrow(() -> new BusinessException("COACHING_NOT_FOUND", "코칭 세션을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!log.getCompleted()) {
            throw new BusinessException("COACHING_NOT_COMPLETED", "코칭이 아직 완료되지 않았습니다", HttpStatus.BAD_REQUEST);
        }

        if (cookingCompletionRepository.existsByCoachingLogId(coachingLogId)) {
            throw new BusinessException("COMPLETION_DUPLICATE", "이미 완성 사진이 등록된 코칭 세션입니다", HttpStatus.CONFLICT);
        }

        FileUploadResponse uploaded = s3FileService.upload(file);

        Integer recipeId = log.getRecipeIds().get(0);
        CookingCompletion completion = new CookingCompletion(userId, recipeId, coachingLogId, uploaded.url());
        cookingCompletionRepository.save(completion);

        // DB trigger increments completed_cooking_count; re-query to get fresh value
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        userRepository.flush();

        RankInfo rankInfo = RankInfo.of(user.getCompletedCookingCount() + 1);

        return CookingCompletionResponse.of(completion, rankInfo);
    }

    private void validateMode(String mode, List<Integer> recipeIds) {
        if (!"single".equals(mode) && !"multi".equals(mode)) {
            throw new BusinessException("INVALID_MODE", "모드는 single 또는 multi여야 합니다", HttpStatus.BAD_REQUEST);
        }
        if ("single".equals(mode) && recipeIds.size() != 1) {
            throw new BusinessException("INVALID_RECIPE_COUNT", "싱글 모드에서는 레시피 1개만 선택해야 합니다", HttpStatus.BAD_REQUEST);
        }
        if ("multi".equals(mode) && recipeIds.size() != 2) {
            throw new BusinessException("INVALID_RECIPE_COUNT", "멀티 모드에서는 레시피 2개를 선택해야 합니다", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateRecipes(List<Integer> recipeIds) {
        for (Integer recipeId : recipeIds) {
            Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(recipeId)
                    .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND", "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

            if (!Boolean.TRUE.equals(recipe.getCoachingReady())) {
                throw new BusinessException("RECIPE_NOT_COACHING_READY",
                        "코칭이 지원되지 않는 레시피입니다: " + recipe.getTitle(), HttpStatus.BAD_REQUEST);
            }
        }
    }
}
