-- V18: 프로토타입 정합 리뉴얼 — 칼로리 + EXP 체계 + 의상 커스텀 시스템
-- 1) recipes.calories (칼로리 노출)
-- 2) users.total_exp (레벨 산정 기반)
-- 3) outfits / user_owned_outfits / user_equipped_outfits / level_reward_logs
-- 4) 레벨 보상 기본 의상 시드

-- =============================================
-- [1] 레시피 칼로리
-- =============================================
ALTER TABLE recipes ADD COLUMN calories INTEGER;

-- =============================================
-- [2] 유저 누적 EXP (기존 요리 카운트 * 80 EXP 환산)
-- =============================================
ALTER TABLE users ADD COLUMN total_exp BIGINT NOT NULL DEFAULT 0;
UPDATE users
SET total_exp = COALESCE(completed_cooking_count, 0) * 80;

-- =============================================
-- [3] Outfit 카탈로그 (상점 판매 + 레벨 보상)
-- =============================================
CREATE TABLE outfits (
    id BIGSERIAL PRIMARY KEY,
    slot VARCHAR(16) NOT NULL,                          -- head / top / bottom / shoes / leftHand / rightHand
    name VARCHAR(60) NOT NULL,
    description VARCHAR(200),
    image_url VARCHAR(500) NOT NULL,
    price_points INTEGER NOT NULL DEFAULT 0,            -- 0이면 비매품(레벨 보상 전용)
    unlock_level SMALLINT,                              -- NULL이면 상점 판매 전용, 숫자면 해당 레벨 도달 시 자동 지급
    is_default BOOLEAN NOT NULL DEFAULT FALSE,          -- 온보딩 완료 시 자동 지급 대상
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outfits_unlock_level ON outfits(unlock_level) WHERE unlock_level IS NOT NULL;
CREATE INDEX idx_outfits_slot_active ON outfits(slot) WHERE is_active = TRUE;

-- =============================================
-- [4] 유저 보유 의상 (인벤토리)
-- =============================================
CREATE TABLE user_owned_outfits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id BIGINT NOT NULL REFERENCES outfits(id),
    acquired_source VARCHAR(16) NOT NULL,               -- SHOP / LEVEL_REWARD / DEFAULT
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, outfit_id)
);
CREATE INDEX idx_user_owned_outfits_user ON user_owned_outfits(user_id);

-- =============================================
-- [5] 유저 장착 상태 (슬롯당 1개 — outfit_id NULL이면 해제)
-- =============================================
CREATE TABLE user_equipped_outfits (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot VARCHAR(16) NOT NULL,
    outfit_id BIGINT REFERENCES outfits(id),
    PRIMARY KEY (user_id, slot)
);

-- =============================================
-- [6] 레벨업 보상 지급 로그 (레벨당 1회 보장)
-- =============================================
CREATE TABLE level_reward_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, level)
);
CREATE INDEX idx_level_reward_logs_user ON level_reward_logs(user_id);

-- =============================================
-- [7] 기본 의상 시드 (Lv.1 기본 세트 + Lv.3/5/7 레벨 보상)
-- =============================================
INSERT INTO outfits (slot, name, description, image_url, price_points, unlock_level, is_default, sort_order) VALUES
    ('top',       '앞치마',     '신규 요리사 기본 앞치마',   '/outfits/apron_default.png', 0, 1, TRUE,  1),
    ('rightHand', '나무 주걱',  '기본 조리 도구',             '/outfits/spoon_wood.png',    0, 1, TRUE,  2),
    ('head',      '요리 모자',  'Lv.3 달성 기념',             '/outfits/chef_hat.png',      0, 3, FALSE, 3),
    ('leftHand',  '프라이팬',   'Lv.5 달성 기념',             '/outfits/frypan.png',        0, 5, FALSE, 4),
    ('rightHand', '뒤집개',     'Lv.5 달성 기념',             '/outfits/spatula.png',       0, 5, FALSE, 5),
    ('top',       '셰프 상의',  'Lv.7 달성 기념',             '/outfits/chef_top.png',      0, 7, FALSE, 6),
    ('bottom',    '셰프 하의',  'Lv.7 달성 기념',             '/outfits/chef_bottom.png',   0, 7, FALSE, 7);
