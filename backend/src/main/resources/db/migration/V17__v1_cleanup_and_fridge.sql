-- V17: v1.0 대청소
-- 1) User 컬럼 정리 (characterType 추가, 코칭/실력/온보딩 컬럼 제거)
-- 2) My Fridge 테이블 신규
-- 3) 코칭 관련 테이블/트리거 전체 제거
-- 4) 쇼츠 관련 테이블 전체 제거

-- =============================================
-- [1] User characterType 추가 + 불필요 컬럼 제거
-- =============================================
ALTER TABLE users ADD COLUMN character_type VARCHAR(20);
ALTER TABLE users DROP COLUMN IF EXISTS cooking_level;
ALTER TABLE users DROP COLUMN IF EXISTS coaching_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS coaching_voice_speed;
ALTER TABLE users DROP COLUMN IF EXISTS is_onboarded;

-- =============================================
-- [2] My Fridge — 사용자별 보유 재료 (이진값)
-- =============================================
CREATE TABLE user_fridge_ingredients (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ingredient_id)
);
CREATE INDEX idx_user_fridge_user ON user_fridge_ingredients(user_id);

-- =============================================
-- [3] 코칭 테이블 + 트리거 제거 (v1.0에서 기능 삭제)
-- =============================================
DROP TRIGGER IF EXISTS trg_recipe_steps_coaching_ready ON recipe_steps;
DROP TRIGGER IF EXISTS trg_cooking_completions_count ON cooking_completions;
DROP FUNCTION IF EXISTS update_coaching_ready();
DROP FUNCTION IF EXISTS increment_cooking_count();

DROP TABLE IF EXISTS coaching_photos CASCADE;
DROP TABLE IF EXISTS cooking_completions CASCADE;
DROP TABLE IF EXISTS coaching_logs CASCADE;

DROP INDEX IF EXISTS idx_recipes_coaching_ready;
ALTER TABLE recipes DROP COLUMN IF EXISTS coaching_ready;

-- =============================================
-- [4] 쇼츠 테이블 전부 제거 (v2.0 부활 예정 — 코드/테이블 임시 삭제)
-- =============================================
DROP TABLE IF EXISTS shorts_favorites CASCADE;
DROP TABLE IF EXISTS shorts_conversion_log CASCADE;
DROP TABLE IF EXISTS shorts_conversion_history CASCADE;
DROP TABLE IF EXISTS shorts_cache CASCADE;
