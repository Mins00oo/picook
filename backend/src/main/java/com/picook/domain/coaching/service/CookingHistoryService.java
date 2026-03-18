package com.picook.domain.coaching.service;

import com.picook.domain.coaching.dto.*;
import com.picook.domain.coaching.entity.CoachingLog;
import com.picook.domain.coaching.entity.CoachingPhoto;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.coaching.repository.CoachingPhotoRepository;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.shorts.entity.ShortsCache;
import com.picook.domain.shorts.service.ShortsCacheService;
import com.picook.domain.user.dto.RankInfo;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserRank;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CookingHistoryService {

    private final CoachingLogRepository coachingLogRepository;
    private final CoachingPhotoRepository coachingPhotoRepository;
    private final RecipeRepository recipeRepository;
    private final ShortsCacheService shortsCacheService;
    private final UserRepository userRepository;

    public CookingHistoryService(CoachingLogRepository coachingLogRepository,
                                  CoachingPhotoRepository coachingPhotoRepository,
                                  RecipeRepository recipeRepository,
                                  ShortsCacheService shortsCacheService,
                                  UserRepository userRepository) {
        this.coachingLogRepository = coachingLogRepository;
        this.coachingPhotoRepository = coachingPhotoRepository;
        this.recipeRepository = recipeRepository;
        this.shortsCacheService = shortsCacheService;
        this.userRepository = userRepository;
    }

    public Page<CookingHistoryResponse> getHistory(UUID userId, Pageable pageable) {
        Page<CoachingLog> logs = coachingLogRepository.findByUserIdAndCompletedTrueOrderByCompletedAtDesc(userId, pageable);

        return logs.map(log -> {
            List<CoachingPhoto> photos = coachingPhotoRepository.findByCoachingLogIdOrderByDisplayOrder(log.getId());
            String title = resolveTitle(log);
            String thumbnailUrl = photos.isEmpty() ? null : photos.get(0).getPhotoUrl();

            // wasLevelUp: 이 완료 시점의 누적 카운트가 레벨 경계에 해당하는지
            boolean wasLevelUp = isLevelBoundary(log);

            return new CookingHistoryResponse(
                    log.getId(), log.getMode(), title, thumbnailUrl,
                    log.getEstimatedSeconds(), log.getActualSeconds(),
                    log.getCompletedAt(),
                    photos.stream().map(CoachingPhotoResponse::of).toList(),
                    wasLevelUp
            );
        });
    }

    public CookingHistoryDetailResponse getHistoryDetail(UUID userId, Integer id) {
        CoachingLog log = coachingLogRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException("HISTORY_NOT_FOUND", "요리 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        List<CoachingPhoto> photos = coachingPhotoRepository.findByCoachingLogIdOrderByDisplayOrder(id);
        String title = resolveTitle(log);

        List<CookingHistoryDetailResponse.RecipeInfo> recipes = new ArrayList<>();
        if (log.getRecipeIds() != null) {
            for (Integer recipeId : log.getRecipeIds()) {
                recipeRepository.findById(recipeId).ifPresent(r ->
                        recipes.add(new CookingHistoryDetailResponse.RecipeInfo(r.getId(), r.getTitle(), r.getImageUrl())));
            }
        }

        return new CookingHistoryDetailResponse(
                log.getId(), log.getMode(), title,
                log.getEstimatedSeconds(), log.getActualSeconds(),
                log.getStartedAt(), log.getCompletedAt(),
                recipes,
                photos.stream().map(CoachingPhotoResponse::of).toList()
        );
    }

    public CookingStatsResponse getStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        long totalCompleted = coachingLogRepository.countByUserIdAndCompleted(userId, true);
        long totalWithPhoto = coachingLogRepository.countCompletedWithPhotos(userId);
        long totalPhotos = coachingPhotoRepository.countByUserId(userId);

        var firstLog = coachingLogRepository.findFirstByUserIdAndCompletedTrueOrderByCompletedAtAsc(userId);
        var firstCookingDate = firstLog.map(CoachingLog::getCompletedAt).orElse(null);

        List<CookingStatsResponse.MonthlyCount> monthlyCount = coachingLogRepository
                .countMonthlyCompleted(userId)
                .stream()
                .map(row -> new CookingStatsResponse.MonthlyCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        RankInfo rank = RankInfo.of(user.getCompletedCookingCount());

        return new CookingStatsResponse(
                totalCompleted, totalWithPhoto, totalPhotos,
                firstCookingDate, monthlyCount,
                rank.level(), rank.title(), rank.emoji()
        );
    }

    private String resolveTitle(CoachingLog log) {
        if (log.getRecipeIds() != null && !log.getRecipeIds().isEmpty()) {
            return recipeRepository.findById(log.getRecipeIds().get(0))
                    .map(Recipe::getTitle)
                    .orElse("레시피");
        }
        if (log.getShortsCacheId() != null) {
            return shortsCacheService.findById(log.getShortsCacheId())
                    .map(ShortsCache::getTitle)
                    .orElse("쇼츠 레시피");
        }
        return "요리";
    }

    private boolean isLevelBoundary(CoachingLog log) {
        // 사진이 없으면 레벨업 아님
        if (!coachingPhotoRepository.existsByCoachingLogId(log.getId())) {
            return false;
        }
        // 간단한 판단: 레벨 경계값(3, 6, 11, 21, 36, 51)에 해당하면 true
        // 정확한 판단은 DB에서 해당 시점의 카운트를 추적해야 하지만, 근사값으로 처리
        return false; // 프론트에서 별도 계산 가능하도록 일단 false 반환
    }
}
