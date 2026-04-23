package com.picook.domain.cookbook.service;

import com.picook.domain.cookbook.dto.CookbookEntryResponse;
import com.picook.domain.cookbook.dto.CookbookStatsResponse;
import com.picook.domain.cookbook.dto.CreateCookbookEntryRequest;
import com.picook.domain.cookbook.entity.CookbookEntry;
import com.picook.domain.cookbook.entity.CookbookPhoto;
import com.picook.domain.cookbook.repository.CookbookEntryRepository;
import com.picook.domain.file.service.FileStorageService;
import com.picook.domain.outfit.dto.OutfitResponse;
import com.picook.domain.point.entity.PointReason;
import com.picook.domain.point.service.PointService;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.domain.user.service.UserLevelService;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class CookbookService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final int MAX_PHOTOS = 4;
    private static final int COOKBOOK_POINTS_WITH_PHOTO = 50;
    private static final long COOKBOOK_EXP_WITH_PHOTO = 80L;

    private final CookbookEntryRepository entryRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PointService pointService;
    private final UserLevelService userLevelService;

    public CookbookService(CookbookEntryRepository entryRepository,
                           RecipeRepository recipeRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           PointService pointService,
                           UserLevelService userLevelService) {
        this.entryRepository = entryRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.pointService = pointService;
        this.userLevelService = userLevelService;
    }

    @Transactional
    public CookbookEntryResponse create(UUID userId, CreateCookbookEntryRequest req, MultipartFile[] photos) {
        if (photos != null && photos.length > MAX_PHOTOS) {
            throw new BusinessException("PHOTO_LIMIT_EXCEEDED",
                    "사진은 최대 " + MAX_PHOTOS + "장까지 업로드 가능합니다", HttpStatus.BAD_REQUEST);
        }

        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(req.recipeId())
                .orElseThrow(() -> new BusinessException("RECIPE_NOT_FOUND",
                        "레시피를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        CookbookEntry entry = new CookbookEntry(userId, recipe, req.rating(), req.memo(), Instant.now());

        int photoCount = 0;
        if (photos != null) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo == null || photo.isEmpty()) continue;
                String url = fileStorageService.upload(photo, "cookbook");
                entry.addPhoto(new CookbookPhoto(url, order++));
                photoCount++;
            }
        }

        CookbookEntry saved = entryRepository.save(entry);

        // 사용자 누적 요리 횟수 (호환성 유지 — 기존 필드)
        User user = userRepository.findById(userId).orElseThrow();
        user.setCompletedCookingCount((user.getCompletedCookingCount() == null ? 0 : user.getCompletedCookingCount()) + 1);

        // 보상: 사진 1장 이상일 때만 지급
        int pointsEarned = 0;
        int expEarned = 0;
        boolean leveledUp = false;
        Integer newLevel = null;
        List<OutfitResponse> grantedOutfits = List.of();

        if (photoCount > 0) {
            pointsEarned = COOKBOOK_POINTS_WITH_PHOTO;
            pointService.award(userId, pointsEarned, PointReason.COOKBOOK_ENTRY, "COOKBOOK", saved.getId());

            UserLevelService.LevelUpResult levelResult = userLevelService.awardExp(userId, COOKBOOK_EXP_WITH_PHOTO);
            expEarned = (int) COOKBOOK_EXP_WITH_PHOTO;
            leveledUp = levelResult.leveledUp();
            newLevel = leveledUp ? levelResult.newLevel() : null;
            grantedOutfits = levelResult.grantedOutfits().stream()
                    .map(OutfitResponse::ofCatalog)
                    .toList();
        }

        long sequenceNumber = entryRepository.countByUserId(userId);

        return CookbookEntryResponse.ofCreated(
                saved,
                pointsEarned,
                expEarned,
                sequenceNumber,
                leveledUp,
                newLevel,
                grantedOutfits
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<CookbookEntryResponse> list(UUID userId, Pageable pageable) {
        Page<CookbookEntryResponse> page = entryRepository
                .findByUserIdOrderByCookedAtDesc(userId, pageable)
                .map(CookbookEntryResponse::of);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public CookbookEntryResponse getDetail(UUID userId, Long entryId) {
        CookbookEntry entry = entryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new BusinessException("COOKBOOK_NOT_FOUND",
                        "요리북 기록을 찾을 수 없습니다", HttpStatus.NOT_FOUND));
        return CookbookEntryResponse.of(entry);
    }

    @Transactional(readOnly = true)
    public long count(UUID userId) {
        return entryRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public CookbookStatsResponse getStats(UUID userId, String yearMonth) {
        YearMonth ym = (yearMonth != null && !yearMonth.isBlank())
                ? YearMonth.parse(yearMonth)
                : YearMonth.from(LocalDate.now(KST));
        Instant from = ym.atDay(1).atStartOfDay(KST).toInstant();
        Instant to = ym.plusMonths(1).atDay(1).atStartOfDay(KST).toInstant();
        long count = entryRepository.countByUserIdAndCookedAtBetween(userId, from, to);
        return new CookbookStatsResponse(ym.toString(), count);
    }
}
