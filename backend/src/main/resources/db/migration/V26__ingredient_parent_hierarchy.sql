-- V26: ingredient 부모-자식 계층 (육류 부위별 family 매칭용)
--
-- 매칭 정책:
--   사용자 "삼겹살" 보유 → "삼겹살" 정확 매칭 ✓
--   사용자 "삼겹살" 보유 → 레시피 "돼지고기"(부모) 매칭 ✓ (상향 매칭)
--   사용자 "삼겹살" 보유 → 레시피 "앞다리살"(sibling) 매칭 ❌
--
-- 데이터:
--   돼지고기 (parent_id = NULL)
--     ├─ 삼겹살 (parent_id = 돼지고기.id)
--     ├─ 목살, 앞다리살, ...
--   소고기 (parent_id = NULL)
--     ├─ 소고기등심, 안심, ...
--   닭고기 (parent_id = NULL)
--     ├─ 닭가슴살, 닭다리살, ...

ALTER TABLE ingredients
    ADD COLUMN IF NOT EXISTS parent_id INTEGER
    REFERENCES ingredients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ingredients_parent
    ON ingredients (parent_id) WHERE parent_id IS NOT NULL;

COMMENT ON COLUMN ingredients.parent_id
    IS '부모 재료 ID (육류 부위 → 메인). 사용자 보유가 자식이면 부모 매칭 OK (상향 매칭).';
