package com.picook.domain.user.service;

import com.picook.domain.user.dto.UpdateProfileRequest;
import com.picook.domain.user.dto.UserProfileResponse;
import com.picook.domain.user.entity.CookingLevel;
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

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getProfile(UUID userId) {
        User user = findActiveUser(userId);
        return UserProfileResponse.of(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findActiveUser(userId);

        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.cookingLevel() != null) {
            try {
                user.setCookingLevel(CookingLevel.valueOf(request.cookingLevel()));
            } catch (IllegalArgumentException e) {
                throw new BusinessException("INVALID_COOKING_LEVEL",
                        "유효하지 않은 요리 수준입니다: " + request.cookingLevel(), HttpStatus.BAD_REQUEST);
            }
        }
        if (request.coachingEnabled() != null) {
            user.setCoachingEnabled(request.coachingEnabled());
        }
        if (request.coachingVoiceSpeed() != null) {
            user.setCoachingVoiceSpeed(request.coachingVoiceSpeed());
        }
        if (request.isOnboarded() != null) {
            user.setIsOnboarded(request.isOnboarded());
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
