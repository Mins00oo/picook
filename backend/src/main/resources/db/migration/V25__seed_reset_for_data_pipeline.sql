-- V25: 데이터 파이프라인 결과 시드 준비 (스키마만, 데이터는 백오피스 엑셀 업로드)
--
-- 이 마이그레이션이 하는 일:
--   1. recipe_steps 에 tip 컬럼 추가 (농정원 STEP_TIP 같은 조리 팁/주의사항)
--   2. unit_conversions 테이블 신규 생성 (재료별 단위 환산표)
--   3. 기존 시드 데이터 모두 정리 (V21/V24 등 이전 시드 무효화)
--
-- 주의:
--   - 이 시점에 user_fridge_ingredients/favorites/cookbook_entries 등 사용자 데이터도 비워짐
--   - 출시 전 dev 환경이라 무관 (운영 시작 후엔 실행 X)
--   - 데이터 시드는 백오피스 엑셀 업로드 화면을 통해 별도로 진행

-- =================================================================
-- 1. recipe_steps 에 tip 컬럼 추가
-- =================================================================
ALTER TABLE recipe_steps
    ADD COLUMN IF NOT EXISTS tip TEXT;

COMMENT ON COLUMN recipe_steps.tip
    IS '조리 팁 / 주의사항 (예: 농정원 STEP_TIP). 단계 옆에 💡 아이콘으로 별도 표시 가능';

-- =================================================================
-- 2. unit_conversions 테이블 신규 생성
-- =================================================================
CREATE TABLE IF NOT EXISTS unit_conversions (
    id              SERIAL          PRIMARY KEY,
    ingredient_id   INTEGER         NOT NULL
                    REFERENCES ingredients(id) ON DELETE CASCADE,
    from_unit       VARCHAR(20)     NOT NULL,
    to_unit         VARCHAR(20)     NOT NULL,
    conversion      DECIMAL(12, 6)  NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    UNIQUE (ingredient_id, from_unit, to_unit)
);

CREATE INDEX IF NOT EXISTS idx_unit_conv_ing
    ON unit_conversions (ingredient_id);

COMMENT ON TABLE unit_conversions
    IS '재료별 단위 환산표. 예: 다진마늘 1g = 0.067큰술 (15g/큰술 기준).';
COMMENT ON COLUMN unit_conversions.conversion
    IS '곱셈 비율. amount_to = amount_from * conversion';

-- =================================================================
-- 3. 기존 시드 데이터 정리 (CASCADE)
-- =================================================================
-- ingredients TRUNCATE CASCADE 시 동시에 비워지는 테이블:
--   - ingredient_synonyms (ingredient_id FK)
--   - recipe_ingredients (ingredient_id FK)
--   - user_fridge_ingredients (ingredient_id FK)
--   - unit_conversions (ingredient_id FK)
-- recipes TRUNCATE CASCADE 시 동시에 비워지는 테이블:
--   - recipe_ingredients (recipe_id FK)
--   - recipe_steps (recipe_id FK)
--   - favorites (recipe_id FK)
--   - cookbook_entries (recipe_id FK, cookbook_photos 도 cascade)
--   - search_history 등
-- 출시 전 dev 환경 가정: 사용자 데이터 = 테스트 잔재라 무관

TRUNCATE TABLE recipes                  RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredients              RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredient_subcategories RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredient_categories    RESTART IDENTITY CASCADE;
TRUNCATE TABLE unit_conversions         RESTART IDENTITY CASCADE;
