package com.picook.domain.user.service;

import com.picook.domain.outfit.entity.LevelRewardLog;
import com.picook.domain.outfit.entity.Outfit;
import com.picook.domain.outfit.entity.UserEquippedOutfit;
import com.picook.domain.outfit.entity.UserOwnedOutfit;
import com.picook.domain.outfit.repository.LevelRewardLogRepository;
import com.picook.domain.outfit.repository.OutfitRepository;
import com.picook.domain.outfit.repository.UserEquippedOutfitRepository;
import com.picook.domain.outfit.repository.UserOwnedOutfitRepository;
import com.picook.domain.user.entity.User;
import com.picook.domain.user.repository.UserRepository;
import com.picook.global.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * v1.0 게임화 — EXP 누적, 레벨 산정, 레벨업 감지 후 의상 자동 지급.
 *
 * EXP 임계치 (mobile constants/levels.ts와 동기화):
 *   Lv1=0, Lv2=240, Lv3=480, Lv4=880, Lv5=1680, Lv6=2880, Lv7=4080
 *
 * 기존 completed_cooking_count(3/6/11/21/36/51회) × 80 EXP/회 환산.
 */
@Service
public class UserLevelService {

    private static final Logger log = LoggerFactory.getLogger(UserLevelService.class);

    private static final long[] LEVEL_THRESHOLDS = { 0, 240, 480, 880, 1680, 2880, 4080 };
    private static final int MAX_LEVEL = LEVEL_THRESHOLDS.length;

    private final UserRepository userRepository;
    private final OutfitRepository outfitRepository;
    private final UserOwnedOutfitRepository ownedRepository;
    private final UserEquippedOutfitRepository equippedRepository;
    private final LevelRewardLogRepository rewardLogRepository;

    public UserLevelService(UserRepository userRepository,
                            OutfitRepository outfitRepository,
                            UserOwnedOutfitRepository ownedRepository,
                            UserEquippedOutfitRepository equippedRepository,
                            LevelRewardLogRepository rewardLogRepository) {
        this.userRepository = userRepository;
        this.outfitRepository = outfitRepository;
        this.ownedRepository = ownedRepository;
        this.equippedRepository = equippedRepository;
        this.rewardLogRepository = rewardLogRepository;
    }

    public static int levelOf(long totalExp) {
        int lv = 1;
        for (int i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (totalExp >= LEVEL_THRESHOLDS[i]) lv = i + 1;
            else break;
        }
        return lv;
    }

    public static long expThresholdFor(int level) {
        if (level <= 1) return 0L;
        if (level > MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL - 1];
        return LEVEL_THRESHOLDS[level - 1];
    }

    /**
     * EXP 누적 + 레벨업 감지 + 해당 레벨 보상 자동 지급.
     * 같은 트랜잭션(REQUIRED)에서 동작하여 포인트 적립과 원자성을 보장.
     *
     * @return EXP 적용 결과 (레벨업/지급 의상 포함)
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public LevelUpResult awardExp(UUID userId, long amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND));

        long before = user.getTotalExp() == null ? 0L : user.getTotalExp();
        long after = before + Math.max(0L, amount);
        user.setTotalExp(after);

        int oldLevel = levelOf(before);
        int newLevel = levelOf(after);

        List<Outfit> granted = new ArrayList<>();
        if (newLevel > oldLevel) {
            granted = grantLevelRewards(userId, oldLevel, newLevel);
        }

        return new LevelUpResult(before, after, oldLevel, newLevel, newLevel > oldLevel, granted);
    }

    /**
     * (oldLevel, newLevel] 구간에 unlock_level이 걸린 의상을 지급.
     * 각 레벨은 1회만 지급(level_reward_logs 유니크 제약).
     * 해당 슬롯이 비어있으면 자동 장착.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public List<Outfit> grantLevelRewards(UUID userId, int oldLevel, int newLevel) {
        if (newLevel <= oldLevel) return List.of();

        List<Outfit> rewards = outfitRepository.findLevelRewards(oldLevel, newLevel);
        List<Outfit> granted = new ArrayList<>();

        for (int lv = oldLevel + 1; lv <= newLevel; lv++) {
            short level = (short) lv;
            if (rewardLogRepository.existsByUserIdAndLevel(userId, level)) continue;
            rewardLogRepository.save(new LevelRewardLog(userId, level));
        }

        for (Outfit outfit : rewards) {
            if (ownedRepository.existsByUserIdAndOutfitId(userId, outfit.getId())) continue;
            ownedRepository.save(new UserOwnedOutfit(userId, outfit.getId(), "LEVEL_REWARD"));
            granted.add(outfit);
            autoEquipIfSlotEmpty(userId, outfit);
        }

        if (!granted.isEmpty()) {
            log.info("level reward granted: userId={}, count={}", userId, granted.size());
        }
        return granted;
    }

    /**
     * 온보딩(셋업) 완료 시 is_default 의상 지급.
     * 멱등: 이미 보유 중이면 skip.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void grantDefaultOutfitsIfNeeded(UUID userId) {
        List<Outfit> defaults = outfitRepository.findAllByIsDefaultTrueAndIsActiveTrue();
        for (Outfit outfit : defaults) {
            if (ownedRepository.existsByUserIdAndOutfitId(userId, outfit.getId())) continue;
            ownedRepository.save(new UserOwnedOutfit(userId, outfit.getId(), "DEFAULT"));
            autoEquipIfSlotEmpty(userId, outfit);
        }
    }

    private void autoEquipIfSlotEmpty(UUID userId, Outfit outfit) {
        equippedRepository.findByUserIdAndSlot(userId, outfit.getSlot()).ifPresentOrElse(
                equipped -> {
                    if (equipped.getOutfitId() == null) {
                        equipped.setOutfitId(outfit.getId());
                    }
                },
                () -> equippedRepository.save(new UserEquippedOutfit(userId, outfit.getSlot(), outfit.getId()))
        );
    }

    /**
     * EXP 적립 결과. 컨트롤러/후속 서비스에서 응답 필드로 활용.
     */
    public record LevelUpResult(
            long totalExpBefore,
            long totalExpAfter,
            int oldLevel,
            int newLevel,
            boolean leveledUp,
            List<Outfit> grantedOutfits
    ) {}
}
