package com.picook.domain.cookbook.service;

import com.picook.domain.cookbook.dto.CookbookEntryResponse;
import com.picook.domain.cookbook.dto.CreateCookbookEntryRequest;
import com.picook.domain.cookbook.entity.CookbookEntry;
import com.picook.domain.cookbook.entity.CookbookPhoto;
import com.picook.domain.cookbook.repository.CookbookEntryRepository;
import com.picook.domain.file.service.FileStorageService;
import com.picook.domain.point.entity.PointReason;
import com.picook.domain.point.service.PointService;
import com.picook.domain.recipe.entity.Recipe;
import com.picook.domain.recipe.repository.RecipeRepository;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

@Service
public class CookbookService {

    private static final int MAX_PHOTOS = 4;
    private static final int COOKBOOK_POINTS = 20;

    private final CookbookEntryRepository entryRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PointService pointService;

    public CookbookService(CookbookEntryRepository entryRepository,
                           RecipeRepository recipeRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService,
                           PointService pointService) {
        this.entryRepository = entryRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.pointService = pointService;
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

        if (photos != null) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo == null || photo.isEmpty()) continue;
                String url = fileStorageService.upload(photo, "cookbook");
                entry.addPhoto(new CookbookPhoto(url, order++));
            }
        }

        CookbookEntry saved = entryRepository.save(entry);

        // 사용자 누적 요리 횟수 증가
        User user = userRepository.findById(userId).orElseThrow();
        user.setCompletedCookingCount((user.getCompletedCookingCount() == null ? 0 : user.getCompletedCookingCount()) + 1);
        userRepository.save(user);

        // 포인트 적립
        pointService.award(userId, COOKBOOK_POINTS, PointReason.COOKBOOK_ENTRY, "COOKBOOK", saved.getId());

        return CookbookEntryResponse.of(saved, COOKBOOK_POINTS);
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
}
