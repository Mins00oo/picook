package com.picook.domain.user.dto;

import com.picook.domain.user.entity.UserRank;

public record RankInfo(
        int level,
        String title,
        String emoji,
        Integer nextLevelAt
) {
    public static RankInfo of(int completedCookingCount) {
        UserRank rank = UserRank.fromCount(completedCookingCount);
        return new RankInfo(
                rank.getLevel(),
                rank.getTitle(),
                rank.getEmoji(),
                rank.getNextLevelAt(completedCookingCount)
        );
    }
}
