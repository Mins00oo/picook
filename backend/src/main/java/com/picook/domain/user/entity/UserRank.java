package com.picook.domain.user.entity;

public enum UserRank {

    LV1(1, "병아리", "🐣", 0, 2),
    LV2(2, "초보 요리사", "🍳", 3, 5),
    LV3(3, "집밥 요리사", "🥘", 6, 10),
    LV4(4, "실력파 요리사", "👨‍🍳", 11, 20),
    LV5(5, "인기 요리사", "⭐", 21, 35),
    LV6(6, "마스터 셰프", "🏆", 36, 50),
    LV7(7, "전설의 셰프", "👑", 51, Integer.MAX_VALUE);

    private final int level;
    private final String title;
    private final String emoji;
    private final int minCount;
    private final int maxCount;

    UserRank(int level, String title, String emoji, int minCount, int maxCount) {
        this.level = level;
        this.title = title;
        this.emoji = emoji;
        this.minCount = minCount;
        this.maxCount = maxCount;
    }

    public static UserRank fromCount(int completedCookingCount) {
        for (UserRank rank : values()) {
            if (completedCookingCount >= rank.minCount && completedCookingCount <= rank.maxCount) {
                return rank;
            }
        }
        return LV7;
    }

    public Integer getNextLevelAt(int currentCount) {
        if (this == LV7) {
            return null;
        }
        return this.maxCount + 1;
    }

    public int getLevel() { return level; }
    public String getTitle() { return title; }
    public String getEmoji() { return emoji; }
    public int getMinCount() { return minCount; }
    public int getMaxCount() { return maxCount; }
}
