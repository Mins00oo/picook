package com.picook.domain.user.dto;

import com.picook.domain.user.entity.UserRank;

public record RankInfo(
        int level,
        String title,
        String emoji,
        Long nextLevelAt,
        long currentExp
) {
    public static RankInfo of(long totalExp) {
        UserRank rank = UserRank.fromExp(totalExp);
        return new RankInfo(
                rank.getLevel(),
                rank.getTitle(),
                rank.getEmoji(),
                rank.getNextLevelAt(),
                totalExp
        );
    }
}
