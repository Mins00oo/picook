package com.picook.domain.admin.user.service;

import com.picook.domain.admin.user.dto.*;
import com.picook.domain.coaching.repository.CoachingLogRepository;
import com.picook.domain.coaching.repository.CookingCompletionRepository;
import com.picook.domain.favorite.repository.FavoriteRepository;
import com.picook.domain.searchhistory.repository.SearchHistoryRepository;
import com.picook.domain.user.entity.LoginType;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserStatus;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import com.picook.global.util.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;
    private final CoachingLogRepository coachingLogRepository;
    private final CookingCompletionRepository cookingCompletionRepository;
    private final FavoriteRepository favoriteRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    public AdminUserService(UserRepository userRepository,
                            CoachingLogRepository coachingLogRepository,
                            CookingCompletionRepository cookingCompletionRepository,
                            FavoriteRepository favoriteRepository,
                            SearchHistoryRepository searchHistoryRepository) {
        this.userRepository = userRepository;
        this.coachingLogRepository = coachingLogRepository;
        this.cookingCompletionRepository = cookingCompletionRepository;
        this.favoriteRepository = favoriteRepository;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    public PageResponse<AdminUserListResponse> getUsers(String status, String loginType,
                                                         Integer levelMin, String keyword,
                                                         int page, int size) {
        UserStatus userStatus = null;
        if (status != null) {
            try {
                userStatus = UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INVALID_STATUS",
                        "유효하지 않은 상태입니다: " + status, HttpStatus.BAD_REQUEST);
            }
        }

        LoginType loginTypeEnum = null;
        if (loginType != null) {
            try {
                loginTypeEnum = LoginType.valueOf(loginType.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INVALID_LOGIN_TYPE",
                        "유효하지 않은 로그인 타입입니다: " + loginType, HttpStatus.BAD_REQUEST);
            }
        }

        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var userPage = userRepository.searchUsers(userStatus, loginTypeEnum, keyword, pageRequest);

        if (levelMin != null) {
            var filtered = userPage.getContent().stream()
                    .filter(u -> u.getCompletedCookingCount() != null
                            && u.getCompletedCookingCount() >= levelMin)
                    .map(AdminUserListResponse::of)
                    .toList();
            return new PageResponse<>(filtered, userPage.getNumber(), userPage.getSize(),
                    userPage.getTotalElements(), userPage.getTotalPages(), userPage.isLast());
        }

        var responsePage = userPage.map(AdminUserListResponse::of);
        return PageResponse.from(responsePage);
    }

    public AdminUserDetailResponse getUser(UUID id) {
        User user = findOrThrow(id);
        long coachingCount = coachingLogRepository.countByUserIdAndCompleted(id, true);
        long completionCount = cookingCompletionRepository.countByUserId(id);
        int favoriteCount = favoriteRepository.countByUserId(id);
        return AdminUserDetailResponse.of(user, coachingCount, completionCount, favoriteCount);
    }

    @Transactional
    public void suspendUser(UUID id, AdminUserSuspendRequest request) {
        User user = findOrThrow(id);
        user.setStatus(UserStatus.SUSPENDED);
        user.setSuspendedReason(request.reason());
    }

    @Transactional
    public void activateUser(UUID id) {
        User user = findOrThrow(id);
        user.setStatus(UserStatus.ACTIVE);
        user.setSuspendedReason(null);
    }

    public PageResponse<AdminUserCoachingLogResponse> getCoachingLogs(UUID userId, int page, int size) {
        findOrThrow(userId);
        var pageRequest = PageRequest.of(page, size, Sort.by("startedAt").descending());
        var logPage = coachingLogRepository.findByUserId(userId, pageRequest);
        var responsePage = logPage.map(AdminUserCoachingLogResponse::of);
        return PageResponse.from(responsePage);
    }

    public PageResponse<AdminUserCompletionResponse> getCompletions(UUID userId, int page, int size) {
        findOrThrow(userId);
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var completionPage = cookingCompletionRepository.findByUserId(userId, pageRequest);
        var responsePage = completionPage.map(AdminUserCompletionResponse::of);
        return PageResponse.from(responsePage);
    }

    public PageResponse<AdminUserFavoriteResponse> getFavorites(UUID userId, int page, int size) {
        findOrThrow(userId);
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var favoritePage = favoriteRepository.findByUserId(userId, pageRequest);
        var responsePage = favoritePage.map(AdminUserFavoriteResponse::of);
        return PageResponse.from(responsePage);
    }

    public PageResponse<AdminUserSearchHistoryResponse> getSearchHistory(UUID userId, int page, int size) {
        findOrThrow(userId);
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var historyPage = searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        var responsePage = historyPage.map(AdminUserSearchHistoryResponse::of);
        return PageResponse.from(responsePage);
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));
    }
}
