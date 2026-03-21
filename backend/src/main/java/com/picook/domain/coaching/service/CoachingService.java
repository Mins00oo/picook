package com.picook.domain.coaching.service;

import com.picook.domain.coaching.dto.*;
import com.picook.domain.coaching.entity.CoachingLog;
import com.picook.domain.coaching.entity.CoachingPhoto;
import com.picook.domain.coaching.entity.CookingCompletion;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.coaching.repository.CoachingPhotoRepository;
import com.picook.domain.coaching.repository.CookingCompletionRepository;
import com.picook.domain.file.service.FileStorageService;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.service.ShortsCacheService;
import com.picook.domain.user.dto.RankInfo;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CoachingService {

    private static final Logger log = LoggerFactory.getLogger(CoachingService.class);

    private static final int MAX_PHOTOS = 5;

    private final CoachingLogRepository coachingLogRepository;
    private final CookingCompletionRepository cookingCompletionRepository;
    private final CoachingPhotoRepository coachingPhotoRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ShortsCacheService shortsCacheService;
    private final TransactionTemplate transactionTemplate;
    private final EntityManager entityManager;

    public CoachingService(CoachingLogRepository coachingLogRepository,
                           CookingCompletionRepository cookingCompletionRepository,
                           CoachingPhotoRepository coachingPhotoRepository,
                           RecipeRepository recipeRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           ShortsCacheService shortsCacheService,
                           PlatformTransactionManager txManager,
                           EntityManager entityManager) {
        this.coachingLogRepository = coachingLogRepository;
        this.cookingCompletionRepository = cookingCompletionRepository;
        this.coachingPhotoRepository = coachingPhotoRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.shortsCacheService = shortsCacheService;
        this.transactionTemplate = new TransactionTemplate(txManager);
        this.entityManager = entityManager;
    }

    @Timed("picook.coaching.start.time")
    @Transactional
    public CoachingLogResponse startCoaching(UUID userId, StartCoachingRequest request) {
        boolean hasRecipes = request.recipeIds() != null && !request.recipeIds().isEmpty();
        boolean hasShorts = request.shortsCacheId() != null;

        if (!hasRecipes && !hasShorts) {
            throw new BusinessException("INVALID_COACHING_SOURCE",
                    "recipeIds 또는 shortsCacheId 중 하나는 필수입니다", HttpStatus.BAD_REQUEST);
        }

        CoachingLog coachingLog;

        if (hasShorts) {
            // 쇼츠 캐시 기반 코칭
            ShortsCache cache = shortsCacheService.findById(request.shortsCacheId())
                    .orElseThrow(() -> new BusinessException("SHORTS_NOT_FOUND",
                            "쇼츠 변환 결과를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

            if (cache.getResult() == null || cache.getResult().isBlank()) {
                throw new BusinessException("SHORTS_NO_RECIPE",
                        "변환된 레시피가 없습니다", HttpStatus.BAD_REQUEST);
            }

            coachingLog = new CoachingLog(userId, "single", request.shortsCacheId(), request.estimatedSeconds());
        } else {
            // 기존 레시피 기반 코칭
            validateMode(request.mode(), request.recipeIds());
            validateRecipes(request.recipeIds());

            coachingLog = new CoachingLog(userId, request.mode(), request.recipeIds(), request.estimatedSeconds());
        }

        coachingLogRepository.save(coachingLog);
        return CoachingLogResponse.of(coachingLog);
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

    /**
     * 완성 사진 업로드 — 파일 저장은 TX 밖, DB 저장만 TX 안에서 수행
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public CookingCompletionResponse uploadCompletionPhoto(UUID userId, Integer coachingLogId, MultipartFile file) {
        // 1. 유효성 검증 (각 조회가 자체 readOnly TX로 실행)
        CoachingLog coachingLog = coachingLogRepository.findByIdAndUserId(coachingLogId, userId)
                .orElseThrow(() -> new BusinessException("COACHING_NOT_FOUND", "코칭 세션을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!coachingLog.getCompleted()) {
            throw new BusinessException("COACHING_NOT_COMPLETED", "코칭이 아직 완료되지 않았습니다", HttpStatus.BAD_REQUEST);
        }

        if (cookingCompletionRepository.existsByCoachingLogId(coachingLogId)) {
            throw new BusinessException("COMPLETION_DUPLICATE", "이미 완성 사진이 등록된 코칭 세션입니다", HttpStatus.CONFLICT);
        }

        // 2. 파일 업로드 — TX 밖 (DB 커넥션 점유 없음)
        String photoUrl = fileStorageService.upload(file, "cooking");

        // 3. DB 저장 — TransactionTemplate으로 짧은 TX
        try {
            return transactionTemplate.execute(status -> {
                // Race condition 방지: TX 안에서 중복 재확인
                if (cookingCompletionRepository.existsByCoachingLogId(coachingLogId)) {
                    throw new BusinessException("COMPLETION_DUPLICATE",
                            "이미 완성 사진이 등록된 코칭 세션입니다", HttpStatus.CONFLICT);
                }

                Integer recipeId = (coachingLog.getRecipeIds() != null && !coachingLog.getRecipeIds().isEmpty())
                        ? coachingLog.getRecipeIds().get(0) : null;
                CookingCompletion completion = new CookingCompletion(userId, recipeId, coachingLogId, photoUrl);
                cookingCompletionRepository.save(completion);

                // flush로 INSERT 실행 → DB 트리거가 completed_cooking_count 증가
                cookingCompletionRepository.flush();

                // refresh로 트리거가 갱신한 count를 정확히 읽기 (+1 수동 계산 제거)
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException("USER_NOT_FOUND",
                                "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
                entityManager.refresh(user);

                RankInfo rankInfo = RankInfo.of(user.getCompletedCookingCount());
                return CookingCompletionResponse.of(completion, rankInfo);
            });
        } catch (BusinessException e) {
            // DB 실패 시 파일 정리
            cleanupFileQuietly(photoUrl);
            throw e;
        } catch (Exception e) {
            cleanupFileQuietly(photoUrl);
            throw e;
        }
    }

    private void cleanupFileQuietly(String url) {
        try {
            fileStorageService.delete(url);
        } catch (Exception e) {
            log.warn("Failed to cleanup file after DB failure: {}", url, e);
        }
    }

    /**
     * 다중 사진 업로드 — 파일 저장은 TX 밖, DB 저장만 TX 안에서 수행
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public PhotoUploadResponse uploadCoachingPhotos(UUID userId, Integer coachingLogId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BusinessException("FILE_EMPTY", "사진을 1장 이상 업로드해주세요", HttpStatus.BAD_REQUEST);
        }
        if (files.size() > MAX_PHOTOS) {
            throw new BusinessException("TOO_MANY_PHOTOS", "사진은 최대 " + MAX_PHOTOS + "장까지 업로드할 수 있습니다", HttpStatus.BAD_REQUEST);
        }

        CoachingLog coachingLog = coachingLogRepository.findByIdAndUserId(coachingLogId, userId)
                .orElseThrow(() -> new BusinessException("COACHING_NOT_FOUND", "코칭 세션을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (!coachingLog.getCompleted()) {
            throw new BusinessException("COACHING_NOT_COMPLETED", "코칭이 아직 완료되지 않았습니다", HttpStatus.BAD_REQUEST);
        }

        int existingCount = coachingPhotoRepository.countByCoachingLogId(coachingLogId);
        if (existingCount + files.size() > MAX_PHOTOS) {
            throw new BusinessException("TOO_MANY_PHOTOS",
                    "사진은 최대 " + MAX_PHOTOS + "장까지 가능합니다 (현재 " + existingCount + "장)", HttpStatus.BAD_REQUEST);
        }

        boolean isFirstUpload = existingCount == 0;

        // 파일 업로드 — TX 밖
        List<String> photoUrls = new java.util.ArrayList<>();
        try {
            for (MultipartFile file : files) {
                photoUrls.add(fileStorageService.upload(file, "cooking"));
            }
        } catch (Exception e) {
            photoUrls.forEach(this::cleanupFileQuietly);
            throw e;
        }

        // DB 저장 — 짧은 TX
        final List<String> savedUrls = photoUrls;
        try {
            return transactionTemplate.execute(status -> {
                List<CoachingPhotoResponse> photoResponses = new java.util.ArrayList<>();
                int order = existingCount;
                for (String url : savedUrls) {
                    CoachingPhoto photo = new CoachingPhoto(coachingLogId, url, order++);
                    coachingPhotoRepository.save(photo);
                    photoResponses.add(CoachingPhotoResponse.of(photo));
                }

                // 첫 사진 업로드 시에만 cooking_count +1
                if (isFirstUpload && !cookingCompletionRepository.existsByCoachingLogId(coachingLogId)) {
                    Integer recipeId = (coachingLog.getRecipeIds() != null && !coachingLog.getRecipeIds().isEmpty())
                            ? coachingLog.getRecipeIds().get(0) : null;
                    CookingCompletion completion = new CookingCompletion(userId, recipeId, coachingLogId, savedUrls.get(0));
                    cookingCompletionRepository.save(completion);
                    cookingCompletionRepository.flush();
                }

                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
                entityManager.refresh(user);
                RankInfo rank = RankInfo.of(user.getCompletedCookingCount());

                return new PhotoUploadResponse(photoResponses, user.getCompletedCookingCount(),
                        rank.level(), rank.title(), rank.emoji());
            });
        } catch (Exception e) {
            savedUrls.forEach(this::cleanupFileQuietly);
            throw e;
        }
    }

    /**
     * 사진 삭제 — 본인 사진만 삭제 가능, 등급은 유지
     */
    @Transactional
    public void deleteCoachingPhoto(UUID userId, Integer photoId) {
        CoachingPhoto photo = coachingPhotoRepository.findById(photoId)
                .orElseThrow(() -> new BusinessException("PHOTO_NOT_FOUND", "사진을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        CoachingLog coachingLog = coachingLogRepository.findByIdAndUserId(photo.getCoachingLogId(), userId)
                .orElseThrow(() -> new BusinessException("PHOTO_NOT_FOUND", "사진을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        coachingPhotoRepository.delete(photo);
        cleanupFileQuietly(photo.getPhotoUrl());
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
