-- V24: 양념 분리 + 누락 재료 추가
-- 목적:
--   1. ingredients.is_seasoning 컬럼 도입 → 추천 매칭률 계산에서 양념 제외
--   2. 양념 카테고리 재료 일괄 분류 (소금/간장/설탕/식초/후추/마늘/생강/버터/장류 등)
--   3. PoC 100건 분석에서 발견된 누락 재료 INSERT (두부/밀가루/브로콜리 등)

-- ============================================
-- 1. is_seasoning 컬럼 추가
-- ============================================
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_seasoning BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================
-- 2. 기존 마스터에서 양념 일괄 분류 (is_seasoning=true)
-- ============================================

-- 소금
UPDATE ingredients SET is_seasoning = true WHERE name IN ('소금', '꽃소금', '천일염', '굵은소금', '맛소금');

-- 간장 전종
UPDATE ingredients SET is_seasoning = true WHERE name LIKE '%간장%';

-- 설탕 전종
UPDATE ingredients SET is_seasoning = true WHERE name LIKE '%설탕%';

-- 식초 전종
UPDATE ingredients SET is_seasoning = true WHERE name LIKE '%식초%';

-- 후추 전종
UPDATE ingredients SET is_seasoning = true WHERE name LIKE '%후추%';

-- 기름류
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '식용유', '참기름', '들기름', '올리브유', '카놀라유', '포도씨유',
    '해바라기유', '아보카도오일', '코코넛오일', '땅콩기름', '들기름'
);

-- 술류 (요리용)
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '맛술', '미림', '청주', '요리용청주', '소주', '정종', '화이트와인'
);

-- 마늘/생강 (사용자 합의: 양념)
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '마늘', '다진마늘', '마늘가루', '생강', '다진생강', '생강가루'
);

-- 단맛 양념
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '올리고당', '물엿', '꿀', '매실', '매실액', '매실청', '조청', '아가베시럽'
);

-- 한식 장류
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '고추장', '된장', '쌈장', '막장', '청국장', '춘장'
);

-- 고추류
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '고춧가루', '고추기름'
);

-- 서양 소스
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '케첩', '마요네즈', '굴소스', '머스타드', '핫소스', '돈까스소스',
    '스리라차소스', '데미글라스소스', '바질페스토', '와사비',
    '간장게장소스', '볶음밥소스'
);

-- 젓갈류
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '새우젓', '액젓', '멸치액젓', '까나리액젓', '참치액', '연두'
);

-- 깨
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '들깨', '참깨', '검은깨', '들깨가루', '깨소금'
);

-- 버터 (사용자 합의: 양념)
UPDATE ingredients SET is_seasoning = true WHERE name LIKE '%버터%' AND name <> '버터넛스쿼시' AND name <> '버터밀크' AND name <> '버터헤드상추';

-- 향신료
UPDATE ingredients SET is_seasoning = true WHERE name IN (
    '월계수잎', '바질', '오레가노', '로즈마리', '타임', '파슬리', '파슬리가루',
    '고수', '큐민', '카레', '카레가루', '강황', '강황가루', '겨자', '겨자가루',
    'MSG', '치킨스톡', '다시다', '다시다(소고기)', '다시다(멸치)',
    '국물용멸치'
);

-- ============================================
-- 3. 누락된 메인 재료 추가
-- ============================================
-- 동일 이름 중복 방지를 위해 ON CONFLICT (name) DO NOTHING

-- 채소 (category_id = 1)
INSERT INTO ingredients (name, category_id, is_seasoning) VALUES
    ('브로콜리', 1, false),
    ('아스파라거스', 1, false),
    ('도라지', 1, false),
    ('숙주', 1, false),
    ('무말랭이', 1, false),
    ('인삼', 1, false),
    ('수삼', 1, false),
    ('김치', 1, false),
    ('배추김치', 1, false),
    ('깍두기', 1, false)
ON CONFLICT (name) DO NOTHING;

-- 곡류/면 (category_id = 6)
INSERT INTO ingredients (name, category_id, is_seasoning) VALUES
    ('두부', 6, false),
    ('순두부', 6, false),
    ('연두부', 6, false),
    ('밀가루', 6, false),
    ('박력분', 6, false),
    ('강력분', 6, false),
    ('녹말가루', 6, false),
    ('전분', 6, false),
    ('옥수수전분', 6, false),
    ('감자전분', 6, false),
    ('라이스페이퍼', 6, false),
    ('백앙금', 6, false),
    ('팥앙금', 6, false)
ON CONFLICT (name) DO NOTHING;

-- 육류 (category_id = 3)
INSERT INTO ingredients (name, category_id, is_seasoning) VALUES
    ('닭뼈', 3, false),
    ('소뼈', 3, false),
    ('사골', 3, false)
ON CONFLICT (name) DO NOTHING;

-- 양념/소스 카테고리에 추가 양념
-- 피클링스파이스(피클용 향신료)는 양념으로 분류
INSERT INTO ingredients (name, category_id, is_seasoning) VALUES
    ('피클링스파이스', 7, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. 검증용 쿼리 (주석)
-- ============================================
-- 양념으로 분류된 재료 수: SELECT COUNT(*) FROM ingredients WHERE is_seasoning = true;
-- 메인 재료 수: SELECT COUNT(*) FROM ingredients WHERE is_seasoning = false;
-- 카테고리별 양념 분포: SELECT c.name, COUNT(*) FROM ingredients i JOIN ingredient_categories c ON c.id = i.category_id WHERE i.is_seasoning = true GROUP BY c.name;
