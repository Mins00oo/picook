package com.picook.domain.point.entity;

public enum PointReason {
    DAILY_CHECK,       // 출석체크 +10
    COOKBOOK_ENTRY,    // 요리 평가 등록 +20
    SHOP_PURCHASE,     // 상점 구매 (미래)
    ADMIN_ADJUST       // 관리자 수동 조정
}
