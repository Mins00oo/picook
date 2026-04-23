package com.picook.domain.user.service;

import com.picook.domain.user.dto.UpdateProfileRequest;
import com.picook.domain.user.dto.UserProfileResponse;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.entity.UserStatus;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserLevelService userLevelService;

    public UserService(UserRepository userRepository, UserLevelService userLevelService) {
        this.userRepository = userRepository;
        this.userLevelService = userLevelService;
    }

    public UserProfileResponse getProfile(UUID userId) {
        User user = findActiveUser(userId);
        return UserProfileResponse.of(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findActiveUser(userId);

        if (request.displayName() != null) {
            String trimmed = request.displayName().trim();
            if (!trimmed.equals(user.getDisplayName()) && userRepository.existsByDisplayName(trimmed)) {
                throw new BusinessException("DISPLAY_NAME_TAKEN",
                        "이미 사용 중인 닉네임입니다", HttpStatus.CONFLICT);
            }
            user.setDisplayName(trimmed);
        }
        boolean firstCharacterSetup = false;
        if (request.characterType() != null) {
            if (user.getCharacterType() == null) firstCharacterSetup = true;
            user.setCharacterType(request.characterType());
        }

        // 온보딩 셋업 완료 시점: characterType이 처음 세팅될 때 기본 의상 지급 (멱등)
        if (firstCharacterSetup) {
            userLevelService.grantDefaultOutfitsIfNeeded(userId);
        }

        return UserProfileResponse.of(user);
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        User user = findActiveUser(userId);
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());
    }

    private User findActiveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BusinessException("USER_DELETED",
                    "탈퇴한 사용자입니다", HttpStatus.FORBIDDEN);
        }
        return user;
    }
}
