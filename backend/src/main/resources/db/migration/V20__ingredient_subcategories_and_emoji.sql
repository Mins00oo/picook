-- V20: 재료 서브카테고리 테이블 + 이모지 컬럼 + 50개 서브카테고리 시드

-- 1) 대카테고리에 이모지 컬럼 추가 + 8개 값 UPDATE
ALTER TABLE ingredient_categories ADD COLUMN emoji VARCHAR(8);

UPDATE ingredient_categories SET emoji = '🥬' WHERE name = '채소';
UPDATE ingredient_categories SET emoji = '🍎' WHERE name = '과일';
UPDATE ingredient_categories SET emoji = '🥩' WHERE name = '육류';
UPDATE ingredient_categories SET emoji = '🐟' WHERE name = '해산물';
UPDATE ingredient_categories SET emoji = '🥛' WHERE name = '유제품/계란';
UPDATE ingredient_categories SET emoji = '🌾' WHERE name = '곡류/면';
UPDATE ingredient_categories SET emoji = '🧂' WHERE name = '양념/소스';
UPDATE ingredient_categories SET emoji = '📦' WHERE name = '기타';

-- 2) 서브카테고리 테이블
CREATE TABLE ingredient_subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES ingredient_categories(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    emoji VARCHAR(8),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (category_id, name)
);
CREATE INDEX idx_ingredient_subcategories_category ON ingredient_subcategories(category_id);

-- 3) 재료 테이블 확장
ALTER TABLE ingredients ADD COLUMN subcategory_id INT REFERENCES ingredient_subcategories(id);
ALTER TABLE ingredients ADD COLUMN emoji VARCHAR(8);
CREATE INDEX idx_ingredients_subcategory ON ingredients(subcategory_id);

-- 4) 서브카테고리 50개 시드
-- 채소 (7)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('잎채소',       '🥬', 1),
    ('뿌리채소',     '🥕', 2),
    ('열매채소',     '🍅', 3),
    ('버섯류',       '🍄', 4),
    ('콩·콩나물',    '🫘', 5),
    ('해조류',       '🌿', 6),
    ('허브·향채',    '🌿', 7)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '채소';

-- 과일 (6)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('장과류',        '🍓', 1),
    ('감귤류',        '🍊', 2),
    ('인과·핵과류',   '🍎', 3),
    ('열대과일',      '🥭', 4),
    ('수박·멜론류',   '🍉', 5),
    ('견과·씨앗',     '🥜', 6)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '과일';

-- 육류 (6)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('소고기',          '🥩', 1),
    ('돼지고기',        '🥓', 2),
    ('가금류',          '🍗', 3),
    ('가공육',          '🌭', 4),
    ('내장·특수부위',   '🫀', 5),
    ('기타육류',        '🍖', 6)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '육류';

-- 해산물 (7)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('생선(생)',       '🐟', 1),
    ('갑각류',         '🦐', 2),
    ('조개류',         '🦪', 3),
    ('두족류',         '🦑', 4),
    ('건어물',         '🐡', 5),
    ('젓갈·어란',      '🥫', 6),
    ('가공해산물',     '🍱', 7)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '해산물';

-- 유제품·계란 (5)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('우유·음료',        '🥛', 1),
    ('치즈',             '🧀', 2),
    ('요거트·발효유',    '🥛', 3),
    ('크림·버터',        '🧈', 4),
    ('계란류',           '🥚', 5)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '유제품/계란';

-- 곡류·면 (7)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('쌀·잡곡',          '🍚', 1),
    ('가루·전분',        '🌾', 2),
    ('한국 면',          '🍜', 3),
    ('아시아 면',        '🍝', 4),
    ('파스타·유럽면',    '🍝', 5),
    ('빵·시리얼',        '🍞', 6),
    ('떡',               '🍡', 7)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '곡류/면';

-- 양념·소스 (8)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('기본조미',            '🧂', 1),
    ('간장·장류',           '🫙', 2),
    ('식초·드레싱',         '🍾', 3),
    ('오일·기름',           '🫒', 4),
    ('가루양념·향신료',     '🌶️', 5),
    ('액체양념',            '🧴', 6),
    ('상업소스',            '🥫', 7),
    ('건조허브·향신잎',     '🌿', 8)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '양념/소스';

-- 기타 (4)
INSERT INTO ingredient_subcategories (category_id, name, emoji, sort_order)
SELECT id, s.name, s.emoji, s.sort_order
FROM ingredient_categories, (VALUES
    ('음료·주류',          '🍷', 1),
    ('가공식품·캔',        '🥫', 2),
    ('베이킹재료',         '🧁', 3),
    ('기타 잡화',          '📦', 4)
) AS s(name, emoji, sort_order)
WHERE ingredient_categories.name = '기타';
