package com.picook.domain.user.entity;

public enum UserRank {

    // v1.0 리뉴얼: EXP 누적 기반 (mobile constants/levels.ts와 동기화)
    //   Lv1=0, Lv2=240, Lv3=480, Lv4=880, Lv5=1680, Lv6=2880, Lv7=4080
    LV1(1, "병아리",        "🐣", 0L,    240L),
    LV2(2, "초보 요리사",   "🍳", 240L,  480L),
    LV3(3, "집밥 요리사",   "🥘", 480L,  880L),
    LV4(4, "실력파 요리사", "👨‍🍳", 880L, 1680L),
    LV5(5, "인기 요리사",   "⭐",  1680L, 2880L),
    LV6(6, "마스터 셰프",   "🏆", 2880L, 4080L),
    LV7(7, "전설의 셰프",   "👑", 4080L, Long.MAX_VALUE);

    private final int level;
    private final String title;
    private final String emoji;
    private final long minExp;
    private final long maxExp;

    UserRank(int level, String title, String emoji, long minExp, long maxExp) {
        this.level = level;
        this.title = title;
        this.emoji = emoji;
        this.minExp = minExp;
        this.maxExp = maxExp;
    }

    public static UserRank fromExp(long totalExp) {
        UserRank found = LV1;
        for (UserRank rank : values()) {
            if (totalExp >= rank.minExp) found = rank;
            else break;
        }
        return found;
    }

    /** @return 다음 레벨 임계 EXP (MAX 레벨이면 null) */
    public Long getNextLevelAt() {
        if (this == LV7) return null;
        return this.maxExp;
    }

    public int getLevel() { return level; }
    public String getTitle() { return title; }
    public String getEmoji() { return emoji; }
    public long getMinExp() { return minExp; }
    public long getMaxExp() { return maxExp; }
}
