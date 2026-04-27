-- V21: 재료 유니버스 시드 (~950개)
-- 생성일: 2026-04-23
-- 구조: 대카테고리 8 × 서브카테고리 50
-- 이모지는 Unicode 표준 매칭 가능한 경우만 지정. 나머지는 subcategory/category fallback 사용.
-- 동의어는 파일 최하단 별도 섹션.

DO $$
DECLARE
    -- 대카테고리
    cat_veg         INT;
    cat_fruit       INT;
    cat_meat        INT;
    cat_seafood     INT;
    cat_dairy       INT;
    cat_grain       INT;
    cat_sauce       INT;
    cat_misc        INT;

    -- 채소 서브
    sub_leaf        INT;
    sub_root        INT;
    sub_fruit_veg   INT;
    sub_mushroom    INT;
    sub_bean        INT;
    sub_seaweed     INT;
    sub_herb        INT;

    -- 과일 서브
    sub_berry       INT;
    sub_citrus      INT;
    sub_pome        INT;
    sub_tropical    INT;
    sub_melon       INT;
    sub_nut         INT;

    -- 육류 서브
    sub_beef        INT;
    sub_pork        INT;
    sub_poultry     INT;
    sub_processed   INT;
    sub_offal       INT;
    sub_other_meat  INT;

    -- 해산물 서브
    sub_fish        INT;
    sub_crustacean  INT;
    sub_shellfish   INT;
    sub_cephalopod  INT;
    sub_dried_fish  INT;
    sub_jeotgal     INT;
    sub_proc_sea    INT;

    -- 유제품·계란 서브
    sub_milk        INT;
    sub_cheese      INT;
    sub_yogurt      INT;
    sub_cream       INT;
    sub_egg         INT;

    -- 곡류·면 서브
    sub_rice        INT;
    sub_flour       INT;
    sub_kr_noodle   INT;
    sub_asia_noodle INT;
    sub_pasta       INT;
    sub_bread       INT;
    sub_tteok       INT;

    -- 양념·소스 서브
    sub_basic       INT;
    sub_jang        INT;
    sub_vinegar     INT;
    sub_oil         INT;
    sub_spice       INT;
    sub_liquid      INT;
    sub_commercial  INT;
    sub_dried_herb  INT;

    -- 기타 서브
    sub_drink       INT;
    sub_canned      INT;
    sub_baking      INT;
    sub_misc_item   INT;
BEGIN
    -- 대카테고리 조회
    SELECT id INTO cat_veg     FROM ingredient_categories WHERE name = '채소';
    SELECT id INTO cat_fruit   FROM ingredient_categories WHERE name = '과일';
    SELECT id INTO cat_meat    FROM ingredient_categories WHERE name = '육류';
    SELECT id INTO cat_seafood FROM ingredient_categories WHERE name = '해산물';
    SELECT id INTO cat_dairy   FROM ingredient_categories WHERE name = '유제품/계란';
    SELECT id INTO cat_grain   FROM ingredient_categories WHERE name = '곡류/면';
    SELECT id INTO cat_sauce   FROM ingredient_categories WHERE name = '양념/소스';
    SELECT id INTO cat_misc    FROM ingredient_categories WHERE name = '기타';

    -- 서브카테고리 조회
    SELECT id INTO sub_leaf       FROM ingredient_subcategories WHERE name = '잎채소'       AND category_id = cat_veg;
    SELECT id INTO sub_root       FROM ingredient_subcategories WHERE name = '뿌리채소'     AND category_id = cat_veg;
    SELECT id INTO sub_fruit_veg  FROM ingredient_subcategories WHERE name = '열매채소'     AND category_id = cat_veg;
    SELECT id INTO sub_mushroom   FROM ingredient_subcategories WHERE name = '버섯류'       AND category_id = cat_veg;
    SELECT id INTO sub_bean       FROM ingredient_subcategories WHERE name = '콩·콩나물'    AND category_id = cat_veg;
    SELECT id INTO sub_seaweed    FROM ingredient_subcategories WHERE name = '해조류'       AND category_id = cat_veg;
    SELECT id INTO sub_herb       FROM ingredient_subcategories WHERE name = '허브·향채'    AND category_id = cat_veg;

    SELECT id INTO sub_berry      FROM ingredient_subcategories WHERE name = '장과류'       AND category_id = cat_fruit;
    SELECT id INTO sub_citrus     FROM ingredient_subcategories WHERE name = '감귤류'       AND category_id = cat_fruit;
    SELECT id INTO sub_pome       FROM ingredient_subcategories WHERE name = '인과·핵과류'  AND category_id = cat_fruit;
    SELECT id INTO sub_tropical   FROM ingredient_subcategories WHERE name = '열대과일'     AND category_id = cat_fruit;
    SELECT id INTO sub_melon      FROM ingredient_subcategories WHERE name = '수박·멜론류'  AND category_id = cat_fruit;
    SELECT id INTO sub_nut        FROM ingredient_subcategories WHERE name = '견과·씨앗'    AND category_id = cat_fruit;

    SELECT id INTO sub_beef       FROM ingredient_subcategories WHERE name = '소고기'          AND category_id = cat_meat;
    SELECT id INTO sub_pork       FROM ingredient_subcategories WHERE name = '돼지고기'        AND category_id = cat_meat;
    SELECT id INTO sub_poultry    FROM ingredient_subcategories WHERE name = '가금류'          AND category_id = cat_meat;
    SELECT id INTO sub_processed  FROM ingredient_subcategories WHERE name = '가공육'          AND category_id = cat_meat;
    SELECT id INTO sub_offal      FROM ingredient_subcategories WHERE name = '내장·특수부위'   AND category_id = cat_meat;
    SELECT id INTO sub_other_meat FROM ingredient_subcategories WHERE name = '기타육류'        AND category_id = cat_meat;

    SELECT id INTO sub_fish       FROM ingredient_subcategories WHERE name = '생선(생)'    AND category_id = cat_seafood;
    SELECT id INTO sub_crustacean FROM ingredient_subcategories WHERE name = '갑각류'      AND category_id = cat_seafood;
    SELECT id INTO sub_shellfish  FROM ingredient_subcategories WHERE name = '조개류'      AND category_id = cat_seafood;
    SELECT id INTO sub_cephalopod FROM ingredient_subcategories WHERE name = '두족류'      AND category_id = cat_seafood;
    SELECT id INTO sub_dried_fish FROM ingredient_subcategories WHERE name = '건어물'      AND category_id = cat_seafood;
    SELECT id INTO sub_jeotgal    FROM ingredient_subcategories WHERE name = '젓갈·어란'   AND category_id = cat_seafood;
    SELECT id INTO sub_proc_sea   FROM ingredient_subcategories WHERE name = '가공해산물'  AND category_id = cat_seafood;

    SELECT id INTO sub_milk       FROM ingredient_subcategories WHERE name = '우유·음료'     AND category_id = cat_dairy;
    SELECT id INTO sub_cheese     FROM ingredient_subcategories WHERE name = '치즈'           AND category_id = cat_dairy;
    SELECT id INTO sub_yogurt     FROM ingredient_subcategories WHERE name = '요거트·발효유'  AND category_id = cat_dairy;
    SELECT id INTO sub_cream      FROM ingredient_subcategories WHERE name = '크림·버터'      AND category_id = cat_dairy;
    SELECT id INTO sub_egg        FROM ingredient_subcategories WHERE name = '계란류'         AND category_id = cat_dairy;

    SELECT id INTO sub_rice        FROM ingredient_subcategories WHERE name = '쌀·잡곡'        AND category_id = cat_grain;
    SELECT id INTO sub_flour       FROM ingredient_subcategories WHERE name = '가루·전분'      AND category_id = cat_grain;
    SELECT id INTO sub_kr_noodle   FROM ingredient_subcategories WHERE name = '한국 면'        AND category_id = cat_grain;
    SELECT id INTO sub_asia_noodle FROM ingredient_subcategories WHERE name = '아시아 면'      AND category_id = cat_grain;
    SELECT id INTO sub_pasta       FROM ingredient_subcategories WHERE name = '파스타·유럽면'  AND category_id = cat_grain;
    SELECT id INTO sub_bread       FROM ingredient_subcategories WHERE name = '빵·시리얼'      AND category_id = cat_grain;
    SELECT id INTO sub_tteok       FROM ingredient_subcategories WHERE name = '떡'             AND category_id = cat_grain;

    SELECT id INTO sub_basic       FROM ingredient_subcategories WHERE name = '기본조미'            AND category_id = cat_sauce;
    SELECT id INTO sub_jang        FROM ingredient_subcategories WHERE name = '간장·장류'           AND category_id = cat_sauce;
    SELECT id INTO sub_vinegar     FROM ingredient_subcategories WHERE name = '식초·드레싱'         AND category_id = cat_sauce;
    SELECT id INTO sub_oil         FROM ingredient_subcategories WHERE name = '오일·기름'           AND category_id = cat_sauce;
    SELECT id INTO sub_spice       FROM ingredient_subcategories WHERE name = '가루양념·향신료'     AND category_id = cat_sauce;
    SELECT id INTO sub_liquid      FROM ingredient_subcategories WHERE name = '액체양념'            AND category_id = cat_sauce;
    SELECT id INTO sub_commercial  FROM ingredient_subcategories WHERE name = '상업소스'            AND category_id = cat_sauce;
    SELECT id INTO sub_dried_herb  FROM ingredient_subcategories WHERE name = '건조허브·향신잎'     AND category_id = cat_sauce;

    SELECT id INTO sub_drink       FROM ingredient_subcategories WHERE name = '음료·주류'      AND category_id = cat_misc;
    SELECT id INTO sub_canned      FROM ingredient_subcategories WHERE name = '가공식품·캔'    AND category_id = cat_misc;
    SELECT id INTO sub_baking      FROM ingredient_subcategories WHERE name = '베이킹재료'     AND category_id = cat_misc;
    SELECT id INTO sub_misc_item   FROM ingredient_subcategories WHERE name = '기타 잡화'      AND category_id = cat_misc;

    -- ==========================================================================
    -- 채소 (200+)
    -- ==========================================================================

    -- 채소 > 잎채소 (53)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('상추', cat_veg, sub_leaf, NULL),
        ('청상추', cat_veg, sub_leaf, NULL),
        ('적상추', cat_veg, sub_leaf, NULL),
        ('꽃상추', cat_veg, sub_leaf, NULL),
        ('양상추', cat_veg, sub_leaf, NULL),
        ('로메인', cat_veg, sub_leaf, NULL),
        ('버터헤드상추', cat_veg, sub_leaf, NULL),
        ('치커리', cat_veg, sub_leaf, NULL),
        ('적치커리', cat_veg, sub_leaf, NULL),
        ('엔다이브', cat_veg, sub_leaf, NULL),
        ('라디치오', cat_veg, sub_leaf, NULL),
        ('케일', cat_veg, sub_leaf, NULL),
        ('루꼴라', cat_veg, sub_leaf, NULL),
        ('배추', cat_veg, sub_leaf, NULL),
        ('알배추', cat_veg, sub_leaf, NULL),
        ('봄동', cat_veg, sub_leaf, NULL),
        ('얼갈이배추', cat_veg, sub_leaf, NULL),
        ('양배추', cat_veg, sub_leaf, NULL),
        ('적양배추', cat_veg, sub_leaf, NULL),
        ('방울양배추', cat_veg, sub_leaf, NULL),
        ('시금치', cat_veg, sub_leaf, NULL),
        ('깻잎', cat_veg, sub_leaf, NULL),
        ('부추', cat_veg, sub_leaf, NULL),
        ('영양부추', cat_veg, sub_leaf, NULL),
        ('쪽파', cat_veg, sub_leaf, NULL),
        ('실파', cat_veg, sub_leaf, NULL),
        ('대파', cat_veg, sub_leaf, NULL),
        ('쑥갓', cat_veg, sub_leaf, NULL),
        ('미나리', cat_veg, sub_leaf, NULL),
        ('돌나물', cat_veg, sub_leaf, NULL),
        ('아욱', cat_veg, sub_leaf, NULL),
        ('비름나물', cat_veg, sub_leaf, NULL),
        ('근대', cat_veg, sub_leaf, NULL),
        ('적근대', cat_veg, sub_leaf, NULL),
        ('냉이', cat_veg, sub_leaf, NULL),
        ('달래', cat_veg, sub_leaf, NULL),
        ('머위', cat_veg, sub_leaf, NULL),
        ('방풍나물', cat_veg, sub_leaf, NULL),
        ('곤드레', cat_veg, sub_leaf, NULL),
        ('취나물', cat_veg, sub_leaf, NULL),
        ('참나물', cat_veg, sub_leaf, NULL),
        ('고사리', cat_veg, sub_leaf, NULL),
        ('두릅', cat_veg, sub_leaf, NULL),
        ('원추리', cat_veg, sub_leaf, NULL),
        ('청경채', cat_veg, sub_leaf, NULL),
        ('다채', cat_veg, sub_leaf, NULL),
        ('공심채', cat_veg, sub_leaf, NULL),
        ('워터크레스', cat_veg, sub_leaf, NULL),
        ('새싹채소', cat_veg, sub_leaf, NULL),
        ('어린잎채소', cat_veg, sub_leaf, NULL),
        ('무청', cat_veg, sub_leaf, NULL),
        ('고구마순', cat_veg, sub_leaf, NULL),
        ('샐러드채소믹스', cat_veg, sub_leaf, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 뿌리채소 (35)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('무', cat_veg, sub_root, NULL),
        ('알타리무', cat_veg, sub_root, NULL),
        ('열무', cat_veg, sub_root, NULL),
        ('콜라비', cat_veg, sub_root, NULL),
        ('순무', cat_veg, sub_root, NULL),
        ('래디시', cat_veg, sub_root, NULL),
        ('당근', cat_veg, sub_root, '🥕'),
        ('미니당근', cat_veg, sub_root, NULL),
        ('감자', cat_veg, sub_root, '🥔'),
        ('자색감자', cat_veg, sub_root, NULL),
        ('고구마', cat_veg, sub_root, '🍠'),
        ('호박고구마', cat_veg, sub_root, NULL),
        ('밤고구마', cat_veg, sub_root, NULL),
        ('자색고구마', cat_veg, sub_root, NULL),
        ('양파', cat_veg, sub_root, '🧅'),
        ('적양파', cat_veg, sub_root, NULL),
        ('흰양파', cat_veg, sub_root, NULL),
        ('샬롯', cat_veg, sub_root, NULL),
        ('마늘', cat_veg, sub_root, '🧄'),
        ('흑마늘', cat_veg, sub_root, NULL),
        ('생강', cat_veg, sub_root, NULL),
        ('우엉', cat_veg, sub_root, NULL),
        ('연근', cat_veg, sub_root, NULL),
        ('비트', cat_veg, sub_root, NULL),
        ('돼지감자', cat_veg, sub_root, NULL),
        ('야콘', cat_veg, sub_root, NULL),
        ('루타바가', cat_veg, sub_root, NULL),
        ('파스닙', cat_veg, sub_root, NULL),
        ('셀러리악', cat_veg, sub_root, NULL),
        ('토란', cat_veg, sub_root, NULL),
        ('마', cat_veg, sub_root, NULL),
        ('참마', cat_veg, sub_root, NULL),
        ('카사바', cat_veg, sub_root, NULL),
        ('호스래디시', cat_veg, sub_root, NULL),
        ('와사비', cat_veg, sub_root, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 열매채소 (34)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('토마토', cat_veg, sub_fruit_veg, '🍅'),
        ('방울토마토', cat_veg, sub_fruit_veg, NULL),
        ('대추방울토마토', cat_veg, sub_fruit_veg, NULL),
        ('찰토마토', cat_veg, sub_fruit_veg, NULL),
        ('그린토마토', cat_veg, sub_fruit_veg, NULL),
        ('가지', cat_veg, sub_fruit_veg, '🍆'),
        ('미니가지', cat_veg, sub_fruit_veg, NULL),
        ('긴가지', cat_veg, sub_fruit_veg, NULL),
        ('애호박', cat_veg, sub_fruit_veg, NULL),
        ('단호박', cat_veg, sub_fruit_veg, '🎃'),
        ('늙은호박', cat_veg, sub_fruit_veg, NULL),
        ('쥬키니호박', cat_veg, sub_fruit_veg, NULL),
        ('버터넛스쿼시', cat_veg, sub_fruit_veg, NULL),
        ('국수호박', cat_veg, sub_fruit_veg, NULL),
        ('오이', cat_veg, sub_fruit_veg, '🥒'),
        ('백오이', cat_veg, sub_fruit_veg, NULL),
        ('흑오이', cat_veg, sub_fruit_veg, NULL),
        ('피클오이', cat_veg, sub_fruit_veg, NULL),
        ('피망', cat_veg, sub_fruit_veg, '🫑'),
        ('홍피망', cat_veg, sub_fruit_veg, NULL),
        ('파프리카', cat_veg, sub_fruit_veg, NULL),
        ('적파프리카', cat_veg, sub_fruit_veg, NULL),
        ('황파프리카', cat_veg, sub_fruit_veg, NULL),
        ('오렌지파프리카', cat_veg, sub_fruit_veg, NULL),
        ('고추', cat_veg, sub_fruit_veg, '🌶️'),
        ('홍고추', cat_veg, sub_fruit_veg, NULL),
        ('청고추', cat_veg, sub_fruit_veg, NULL),
        ('풋고추', cat_veg, sub_fruit_veg, NULL),
        ('꽈리고추', cat_veg, sub_fruit_veg, NULL),
        ('오이고추', cat_veg, sub_fruit_veg, NULL),
        ('청양고추', cat_veg, sub_fruit_veg, NULL),
        ('할라피뇨', cat_veg, sub_fruit_veg, NULL),
        ('옥수수', cat_veg, sub_fruit_veg, '🌽'),
        ('초당옥수수', cat_veg, sub_fruit_veg, NULL),
        ('미니옥수수', cat_veg, sub_fruit_veg, NULL),
        ('오크라', cat_veg, sub_fruit_veg, NULL),
        ('여주', cat_veg, sub_fruit_veg, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 버섯류 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('표고버섯', cat_veg, sub_mushroom, NULL),
        ('건표고버섯', cat_veg, sub_mushroom, NULL),
        ('느타리버섯', cat_veg, sub_mushroom, NULL),
        ('팽이버섯', cat_veg, sub_mushroom, '🍄'),
        ('새송이버섯', cat_veg, sub_mushroom, NULL),
        ('양송이버섯', cat_veg, sub_mushroom, NULL),
        ('갈색양송이', cat_veg, sub_mushroom, NULL),
        ('목이버섯', cat_veg, sub_mushroom, NULL),
        ('흰목이버섯', cat_veg, sub_mushroom, NULL),
        ('석이버섯', cat_veg, sub_mushroom, NULL),
        ('송이버섯', cat_veg, sub_mushroom, NULL),
        ('만가닥버섯', cat_veg, sub_mushroom, NULL),
        ('능이버섯', cat_veg, sub_mushroom, NULL),
        ('잎새버섯', cat_veg, sub_mushroom, NULL),
        ('꽃송이버섯', cat_veg, sub_mushroom, NULL),
        ('포르치니버섯', cat_veg, sub_mushroom, NULL),
        ('송로버섯', cat_veg, sub_mushroom, NULL),
        ('블랙트러플', cat_veg, sub_mushroom, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 콩·콩나물 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('콩나물', cat_veg, sub_bean, NULL),
        ('숙주나물', cat_veg, sub_bean, NULL),
        ('완두콩', cat_veg, sub_bean, NULL),
        ('깍지완두', cat_veg, sub_bean, NULL),
        ('껍질콩', cat_veg, sub_bean, NULL),
        ('강낭콩', cat_veg, sub_bean, NULL),
        ('적강낭콩', cat_veg, sub_bean, NULL),
        ('흰강낭콩', cat_veg, sub_bean, NULL),
        ('병아리콩', cat_veg, sub_bean, NULL),
        ('녹렌틸콩', cat_veg, sub_bean, NULL),
        ('홍렌틸콩', cat_veg, sub_bean, NULL),
        ('흑렌틸콩', cat_veg, sub_bean, NULL),
        ('서리태', cat_veg, sub_bean, NULL),
        ('검은콩', cat_veg, sub_bean, NULL),
        ('노란콩', cat_veg, sub_bean, NULL),
        ('녹두', cat_veg, sub_bean, NULL),
        ('팥', cat_veg, sub_bean, NULL),
        ('동부콩', cat_veg, sub_bean, NULL),
        ('에다마메', cat_veg, sub_bean, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 해조류 (15)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('김', cat_veg, sub_seaweed, NULL),
        ('건김', cat_veg, sub_seaweed, NULL),
        ('조미김', cat_veg, sub_seaweed, NULL),
        ('김밥김', cat_veg, sub_seaweed, NULL),
        ('돌김', cat_veg, sub_seaweed, NULL),
        ('미역', cat_veg, sub_seaweed, NULL),
        ('건미역', cat_veg, sub_seaweed, NULL),
        ('미역줄기', cat_veg, sub_seaweed, NULL),
        ('다시마', cat_veg, sub_seaweed, NULL),
        ('건다시마', cat_veg, sub_seaweed, NULL),
        ('쌈다시마', cat_veg, sub_seaweed, NULL),
        ('톳', cat_veg, sub_seaweed, NULL),
        ('파래', cat_veg, sub_seaweed, NULL),
        ('매생이', cat_veg, sub_seaweed, NULL),
        ('꼬시래기', cat_veg, sub_seaweed, NULL),
        ('청각', cat_veg, sub_seaweed, NULL),
        ('우뭇가사리', cat_veg, sub_seaweed, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 채소 > 허브·향채 (22)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('바질', cat_veg, sub_herb, NULL),
        ('타이바질', cat_veg, sub_herb, NULL),
        ('로즈마리', cat_veg, sub_herb, NULL),
        ('타임', cat_veg, sub_herb, NULL),
        ('오레가노', cat_veg, sub_herb, NULL),
        ('딜', cat_veg, sub_herb, NULL),
        ('이탈리안파슬리', cat_veg, sub_herb, NULL),
        ('컬리파슬리', cat_veg, sub_herb, NULL),
        ('고수', cat_veg, sub_herb, NULL),
        ('스피어민트', cat_veg, sub_herb, NULL),
        ('페퍼민트', cat_veg, sub_herb, NULL),
        ('애플민트', cat_veg, sub_herb, NULL),
        ('타라곤', cat_veg, sub_herb, NULL),
        ('차빌', cat_veg, sub_herb, NULL),
        ('세이지', cat_veg, sub_herb, NULL),
        ('라벤더', cat_veg, sub_herb, NULL),
        ('레몬밤', cat_veg, sub_herb, NULL),
        ('레몬그라스', cat_veg, sub_herb, NULL),
        ('마조람', cat_veg, sub_herb, NULL),
        ('카피르라임잎', cat_veg, sub_herb, NULL),
        ('판단잎', cat_veg, sub_herb, NULL),
        ('자소엽', cat_veg, sub_herb, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 과일 (91)
    -- ==========================================================================

    -- 과일 > 장과류 (15)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('딸기', cat_fruit, sub_berry, '🍓'),
        ('블루베리', cat_fruit, sub_berry, '🫐'),
        ('라즈베리', cat_fruit, sub_berry, NULL),
        ('블랙베리', cat_fruit, sub_berry, NULL),
        ('크랜베리', cat_fruit, sub_berry, NULL),
        ('구스베리', cat_fruit, sub_berry, NULL),
        ('오디', cat_fruit, sub_berry, NULL),
        ('보이즌베리', cat_fruit, sub_berry, NULL),
        ('레드커런트', cat_fruit, sub_berry, NULL),
        ('포도', cat_fruit, sub_berry, '🍇'),
        ('청포도', cat_fruit, sub_berry, NULL),
        ('거봉', cat_fruit, sub_berry, NULL),
        ('샤인머스캣', cat_fruit, sub_berry, NULL),
        ('머스캣', cat_fruit, sub_berry, NULL),
        ('머루', cat_fruit, sub_berry, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 과일 > 감귤류 (13)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('귤', cat_fruit, sub_citrus, '🍊'),
        ('한라봉', cat_fruit, sub_citrus, NULL),
        ('천혜향', cat_fruit, sub_citrus, NULL),
        ('황금향', cat_fruit, sub_citrus, NULL),
        ('레드향', cat_fruit, sub_citrus, NULL),
        ('청견오렌지', cat_fruit, sub_citrus, NULL),
        ('레몬', cat_fruit, sub_citrus, '🍋'),
        ('라임', cat_fruit, sub_citrus, NULL),
        ('오렌지', cat_fruit, sub_citrus, NULL),
        ('블러드오렌지', cat_fruit, sub_citrus, NULL),
        ('자몽', cat_fruit, sub_citrus, NULL),
        ('유자', cat_fruit, sub_citrus, NULL),
        ('금귤', cat_fruit, sub_citrus, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 과일 > 인과·핵과류 (22)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('사과', cat_fruit, sub_pome, '🍎'),
        ('부사사과', cat_fruit, sub_pome, NULL),
        ('홍로사과', cat_fruit, sub_pome, NULL),
        ('청사과', cat_fruit, sub_pome, '🍏'),
        ('아오리사과', cat_fruit, sub_pome, NULL),
        ('배', cat_fruit, sub_pome, '🍐'),
        ('신고배', cat_fruit, sub_pome, NULL),
        ('미니배', cat_fruit, sub_pome, NULL),
        ('복숭아', cat_fruit, sub_pome, '🍑'),
        ('백도', cat_fruit, sub_pome, NULL),
        ('천도복숭아', cat_fruit, sub_pome, NULL),
        ('황도', cat_fruit, sub_pome, NULL),
        ('자두', cat_fruit, sub_pome, NULL),
        ('체리', cat_fruit, sub_pome, '🍒'),
        ('앵두', cat_fruit, sub_pome, NULL),
        ('살구', cat_fruit, sub_pome, NULL),
        ('매실', cat_fruit, sub_pome, NULL),
        ('단감', cat_fruit, sub_pome, NULL),
        ('홍시', cat_fruit, sub_pome, NULL),
        ('곶감', cat_fruit, sub_pome, NULL),
        ('대추', cat_fruit, sub_pome, NULL),
        ('아보카도', cat_fruit, sub_pome, '🥑')
    ON CONFLICT (name) DO NOTHING;

    -- 과일 > 열대과일 (19)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('바나나', cat_fruit, sub_tropical, '🍌'),
        ('미니바나나', cat_fruit, sub_tropical, NULL),
        ('망고', cat_fruit, sub_tropical, '🥭'),
        ('애플망고', cat_fruit, sub_tropical, NULL),
        ('옐로망고', cat_fruit, sub_tropical, NULL),
        ('파인애플', cat_fruit, sub_tropical, '🍍'),
        ('키위', cat_fruit, sub_tropical, '🥝'),
        ('골드키위', cat_fruit, sub_tropical, NULL),
        ('리치', cat_fruit, sub_tropical, NULL),
        ('용과', cat_fruit, sub_tropical, NULL),
        ('망고스틴', cat_fruit, sub_tropical, NULL),
        ('파파야', cat_fruit, sub_tropical, NULL),
        ('패션프루트', cat_fruit, sub_tropical, NULL),
        ('구아바', cat_fruit, sub_tropical, NULL),
        ('두리안', cat_fruit, sub_tropical, NULL),
        ('람부탄', cat_fruit, sub_tropical, NULL),
        ('스타프루트', cat_fruit, sub_tropical, NULL),
        ('코코넛', cat_fruit, sub_tropical, '🥥'),
        ('코코넛워터', cat_fruit, sub_tropical, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 과일 > 수박·멜론류 (6)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('수박', cat_fruit, sub_melon, '🍉'),
        ('씨없는수박', cat_fruit, sub_melon, NULL),
        ('참외', cat_fruit, sub_melon, '🍈'),
        ('멜론', cat_fruit, sub_melon, NULL),
        ('허니듀멜론', cat_fruit, sub_melon, NULL),
        ('칸탈루프', cat_fruit, sub_melon, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 과일 > 견과·씨앗 (16)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('아몬드', cat_fruit, sub_nut, NULL),
        ('구운아몬드', cat_fruit, sub_nut, NULL),
        ('호두', cat_fruit, sub_nut, NULL),
        ('캐슈넛', cat_fruit, sub_nut, NULL),
        ('피칸', cat_fruit, sub_nut, NULL),
        ('피스타치오', cat_fruit, sub_nut, NULL),
        ('마카다미아', cat_fruit, sub_nut, NULL),
        ('헤이즐넛', cat_fruit, sub_nut, NULL),
        ('브라질너트', cat_fruit, sub_nut, NULL),
        ('잣', cat_fruit, sub_nut, NULL),
        ('은행', cat_fruit, sub_nut, NULL),
        ('해바라기씨', cat_fruit, sub_nut, NULL),
        ('호박씨', cat_fruit, sub_nut, NULL),
        ('치아씨', cat_fruit, sub_nut, NULL),
        ('아마씨', cat_fruit, sub_nut, NULL),
        ('땅콩', cat_fruit, sub_nut, '🥜')
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 육류 (98)
    -- ==========================================================================

    -- 육류 > 소고기 (25)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('소등심', cat_meat, sub_beef, '🥩'),
        ('소안심', cat_meat, sub_beef, NULL),
        ('소채끝', cat_meat, sub_beef, NULL),
        ('소갈비(찜용)', cat_meat, sub_beef, NULL),
        ('소갈비(구이용)', cat_meat, sub_beef, NULL),
        ('LA갈비', cat_meat, sub_beef, NULL),
        ('차돌박이', cat_meat, sub_beef, NULL),
        ('우삼겹', cat_meat, sub_beef, NULL),
        ('소양지', cat_meat, sub_beef, NULL),
        ('업진살', cat_meat, sub_beef, NULL),
        ('치마살', cat_meat, sub_beef, NULL),
        ('사태', cat_meat, sub_beef, NULL),
        ('소우둔살', cat_meat, sub_beef, NULL),
        ('홍두깨살', cat_meat, sub_beef, NULL),
        ('부채살', cat_meat, sub_beef, NULL),
        ('토시살', cat_meat, sub_beef, NULL),
        ('제비추리', cat_meat, sub_beef, NULL),
        ('꽃살', cat_meat, sub_beef, NULL),
        ('소목심', cat_meat, sub_beef, NULL),
        ('아롱사태', cat_meat, sub_beef, NULL),
        ('살치살', cat_meat, sub_beef, NULL),
        ('안창살', cat_meat, sub_beef, NULL),
        ('척아이롤', cat_meat, sub_beef, NULL),
        ('소갈빗살', cat_meat, sub_beef, NULL),
        ('소불고기용', cat_meat, sub_beef, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 육류 > 돼지고기 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('삼겹살', cat_meat, sub_pork, '🥓'),
        ('오겹살', cat_meat, sub_pork, NULL),
        ('목살', cat_meat, sub_pork, NULL),
        ('돼지등심', cat_meat, sub_pork, NULL),
        ('돼지안심', cat_meat, sub_pork, NULL),
        ('뒷다리살', cat_meat, sub_pork, NULL),
        ('앞다리살', cat_meat, sub_pork, NULL),
        ('항정살', cat_meat, sub_pork, NULL),
        ('갈매기살', cat_meat, sub_pork, NULL),
        ('꼬들살', cat_meat, sub_pork, NULL),
        ('돼지갈비', cat_meat, sub_pork, NULL),
        ('돼지족', cat_meat, sub_pork, NULL),
        ('오돌뼈', cat_meat, sub_pork, NULL),
        ('뽈살', cat_meat, sub_pork, NULL),
        ('돼지혀', cat_meat, sub_pork, NULL),
        ('돼지머리고기', cat_meat, sub_pork, NULL),
        ('제육용돼지', cat_meat, sub_pork, NULL),
        ('돼지불고기용', cat_meat, sub_pork, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 육류 > 가금류 (21)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('닭가슴살', cat_meat, sub_poultry, '🍗'),
        ('닭다리', cat_meat, sub_poultry, NULL),
        ('닭다리살', cat_meat, sub_poultry, NULL),
        ('닭안심', cat_meat, sub_poultry, NULL),
        ('닭날개', cat_meat, sub_poultry, NULL),
        ('닭봉', cat_meat, sub_poultry, NULL),
        ('닭똥집', cat_meat, sub_poultry, NULL),
        ('닭발', cat_meat, sub_poultry, NULL),
        ('닭껍질', cat_meat, sub_poultry, NULL),
        ('통닭', cat_meat, sub_poultry, NULL),
        ('삼계닭', cat_meat, sub_poultry, NULL),
        ('토종닭', cat_meat, sub_poultry, NULL),
        ('오리', cat_meat, sub_poultry, NULL),
        ('오리가슴살', cat_meat, sub_poultry, NULL),
        ('오리다리', cat_meat, sub_poultry, NULL),
        ('훈제오리', cat_meat, sub_poultry, NULL),
        ('메추리', cat_meat, sub_poultry, NULL),
        ('메추리다리', cat_meat, sub_poultry, NULL),
        ('꿩', cat_meat, sub_poultry, NULL),
        ('칠면조', cat_meat, sub_poultry, '🦃'),
        ('칠면조가슴살', cat_meat, sub_poultry, NULL),
        ('거위', cat_meat, sub_poultry, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 육류 > 가공육 (16)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('햄(슬라이스)', cat_meat, sub_processed, NULL),
        ('통햄', cat_meat, sub_processed, NULL),
        ('스팸', cat_meat, sub_processed, NULL),
        ('런천미트', cat_meat, sub_processed, NULL),
        ('베이컨', cat_meat, sub_processed, NULL),
        ('훈제베이컨', cat_meat, sub_processed, NULL),
        ('비엔나소시지', cat_meat, sub_processed, NULL),
        ('프랑크소시지', cat_meat, sub_processed, NULL),
        ('살라미', cat_meat, sub_processed, NULL),
        ('페퍼로니', cat_meat, sub_processed, NULL),
        ('초리조', cat_meat, sub_processed, NULL),
        ('순대', cat_meat, sub_processed, NULL),
        ('족발', cat_meat, sub_processed, NULL),
        ('보쌈', cat_meat, sub_processed, NULL),
        ('햄버거패티', cat_meat, sub_processed, NULL),
        ('미트볼', cat_meat, sub_processed, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 육류 > 내장·특수부위 (11)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('소간', cat_meat, sub_offal, NULL),
        ('돼지간', cat_meat, sub_offal, NULL),
        ('대창', cat_meat, sub_offal, NULL),
        ('막창', cat_meat, sub_offal, NULL),
        ('소곱창', cat_meat, sub_offal, NULL),
        ('돼지곱창', cat_meat, sub_offal, NULL),
        ('소혀', cat_meat, sub_offal, NULL),
        ('우설', cat_meat, sub_offal, NULL),
        ('우족', cat_meat, sub_offal, NULL),
        ('돼지껍질', cat_meat, sub_offal, NULL),
        ('돼지등뼈', cat_meat, sub_offal, NULL),
        ('닭염통', cat_meat, sub_offal, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 육류 > 기타육류 (7)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('양고기', cat_meat, sub_other_meat, NULL),
        ('양갈비', cat_meat, sub_other_meat, NULL),
        ('양등심', cat_meat, sub_other_meat, NULL),
        ('양다리', cat_meat, sub_other_meat, NULL),
        ('양꼬치용', cat_meat, sub_other_meat, NULL),
        ('토끼고기', cat_meat, sub_other_meat, NULL),
        ('사슴고기', cat_meat, sub_other_meat, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 해산물 (135)
    -- ==========================================================================

    -- 해산물 > 생선(생) (40)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('고등어', cat_seafood, sub_fish, '🐟'),
        ('갈치', cat_seafood, sub_fish, NULL),
        ('삼치', cat_seafood, sub_fish, NULL),
        ('참치(생)', cat_seafood, sub_fish, NULL),
        ('연어', cat_seafood, sub_fish, NULL),
        ('훈제연어', cat_seafood, sub_fish, NULL),
        ('대구', cat_seafood, sub_fish, NULL),
        ('명태', cat_seafood, sub_fish, NULL),
        ('조기', cat_seafood, sub_fish, NULL),
        ('참조기', cat_seafood, sub_fish, NULL),
        ('굴비', cat_seafood, sub_fish, NULL),
        ('민어', cat_seafood, sub_fish, NULL),
        ('가자미', cat_seafood, sub_fish, NULL),
        ('광어', cat_seafood, sub_fish, NULL),
        ('참돔', cat_seafood, sub_fish, NULL),
        ('방어', cat_seafood, sub_fish, NULL),
        ('병어', cat_seafood, sub_fish, NULL),
        ('전어', cat_seafood, sub_fish, NULL),
        ('꽁치', cat_seafood, sub_fish, NULL),
        ('청어', cat_seafood, sub_fish, NULL),
        ('생멸치', cat_seafood, sub_fish, NULL),
        ('붕어', cat_seafood, sub_fish, NULL),
        ('잉어', cat_seafood, sub_fish, NULL),
        ('장어', cat_seafood, sub_fish, NULL),
        ('뱀장어', cat_seafood, sub_fish, NULL),
        ('빙어', cat_seafood, sub_fish, NULL),
        ('열기', cat_seafood, sub_fish, NULL),
        ('우럭', cat_seafood, sub_fish, NULL),
        ('쥐치', cat_seafood, sub_fish, NULL),
        ('농어', cat_seafood, sub_fish, NULL),
        ('숭어', cat_seafood, sub_fish, NULL),
        ('메기', cat_seafood, sub_fish, NULL),
        ('전갱이', cat_seafood, sub_fish, NULL),
        ('쏘가리', cat_seafood, sub_fish, NULL),
        ('홍어', cat_seafood, sub_fish, NULL),
        ('임연수어', cat_seafood, sub_fish, NULL),
        ('가오리', cat_seafood, sub_fish, NULL),
        ('다금바리', cat_seafood, sub_fish, NULL),
        ('복어', cat_seafood, sub_fish, NULL),
        ('황새치', cat_seafood, sub_fish, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 갑각류 (13)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('새우', cat_seafood, sub_crustacean, '🦐'),
        ('대하', cat_seafood, sub_crustacean, NULL),
        ('흰다리새우', cat_seafood, sub_crustacean, NULL),
        ('보리새우', cat_seafood, sub_crustacean, NULL),
        ('왕새우', cat_seafood, sub_crustacean, NULL),
        ('민물새우', cat_seafood, sub_crustacean, NULL),
        ('바닷가재', cat_seafood, sub_crustacean, '🦞'),
        ('꽃게', cat_seafood, sub_crustacean, '🦀'),
        ('대게', cat_seafood, sub_crustacean, NULL),
        ('홍게', cat_seafood, sub_crustacean, NULL),
        ('털게', cat_seafood, sub_crustacean, NULL),
        ('킹크랩', cat_seafood, sub_crustacean, NULL),
        ('가재', cat_seafood, sub_crustacean, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 조개류 (19)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('바지락', cat_seafood, sub_shellfish, NULL),
        ('모시조개', cat_seafood, sub_shellfish, NULL),
        ('백합', cat_seafood, sub_shellfish, NULL),
        ('홍합', cat_seafood, sub_shellfish, NULL),
        ('홍합살', cat_seafood, sub_shellfish, NULL),
        ('굴', cat_seafood, sub_shellfish, '🦪'),
        ('석화', cat_seafood, sub_shellfish, NULL),
        ('가리비', cat_seafood, sub_shellfish, NULL),
        ('전복', cat_seafood, sub_shellfish, NULL),
        ('소라', cat_seafood, sub_shellfish, NULL),
        ('꼬막', cat_seafood, sub_shellfish, NULL),
        ('새꼬막', cat_seafood, sub_shellfish, NULL),
        ('참꼬막', cat_seafood, sub_shellfish, NULL),
        ('피꼬막', cat_seafood, sub_shellfish, NULL),
        ('재첩', cat_seafood, sub_shellfish, NULL),
        ('대합', cat_seafood, sub_shellfish, NULL),
        ('개조개', cat_seafood, sub_shellfish, NULL),
        ('키조개', cat_seafood, sub_shellfish, NULL),
        ('맛조개', cat_seafood, sub_shellfish, NULL),
        ('골뱅이', cat_seafood, sub_shellfish, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 두족류 (8)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('오징어', cat_seafood, sub_cephalopod, '🦑'),
        ('새끼오징어', cat_seafood, sub_cephalopod, NULL),
        ('낙지', cat_seafood, sub_cephalopod, NULL),
        ('문어', cat_seafood, sub_cephalopod, '🐙'),
        ('주꾸미', cat_seafood, sub_cephalopod, NULL),
        ('갑오징어', cat_seafood, sub_cephalopod, NULL),
        ('한치', cat_seafood, sub_cephalopod, NULL),
        ('무늬오징어', cat_seafood, sub_cephalopod, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 건어물 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('마른멸치', cat_seafood, sub_dried_fish, NULL),
        ('볶음용멸치', cat_seafood, sub_dried_fish, NULL),
        ('국물용멸치', cat_seafood, sub_dried_fish, NULL),
        ('마른새우', cat_seafood, sub_dried_fish, NULL),
        ('건홍합', cat_seafood, sub_dried_fish, NULL),
        ('건오징어', cat_seafood, sub_dried_fish, NULL),
        ('황태', cat_seafood, sub_dried_fish, NULL),
        ('북어', cat_seafood, sub_dried_fish, NULL),
        ('코다리', cat_seafood, sub_dried_fish, NULL),
        ('가자미포', cat_seafood, sub_dried_fish, NULL),
        ('북어포', cat_seafood, sub_dried_fish, NULL),
        ('황태포', cat_seafood, sub_dried_fish, NULL),
        ('마른문어', cat_seafood, sub_dried_fish, NULL),
        ('건해삼', cat_seafood, sub_dried_fish, NULL),
        ('과메기', cat_seafood, sub_dried_fish, NULL),
        ('쥐포', cat_seafood, sub_dried_fish, NULL),
        ('명태포', cat_seafood, sub_dried_fish, NULL),
        ('가쓰오부시', cat_seafood, sub_dried_fish, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 젓갈·어란 (15)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('명란', cat_seafood, sub_jeotgal, NULL),
        ('명란젓', cat_seafood, sub_jeotgal, NULL),
        ('창난젓', cat_seafood, sub_jeotgal, NULL),
        ('낙지젓', cat_seafood, sub_jeotgal, NULL),
        ('오징어젓', cat_seafood, sub_jeotgal, NULL),
        ('조개젓', cat_seafood, sub_jeotgal, NULL),
        ('새우젓', cat_seafood, sub_jeotgal, NULL),
        ('까나리액젓', cat_seafood, sub_jeotgal, NULL),
        ('멸치액젓', cat_seafood, sub_jeotgal, NULL),
        ('참치액젓', cat_seafood, sub_jeotgal, NULL),
        ('황석어젓', cat_seafood, sub_jeotgal, NULL),
        ('갈치속젓', cat_seafood, sub_jeotgal, NULL),
        ('연어알', cat_seafood, sub_jeotgal, NULL),
        ('날치알', cat_seafood, sub_jeotgal, NULL),
        ('캐비어', cat_seafood, sub_jeotgal, NULL),
        ('성게알', cat_seafood, sub_jeotgal, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 해산물 > 가공해산물 (11)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('어묵(사각)', cat_seafood, sub_proc_sea, NULL),
        ('어묵꼬치', cat_seafood, sub_proc_sea, NULL),
        ('긴어묵', cat_seafood, sub_proc_sea, NULL),
        ('맛살', cat_seafood, sub_proc_sea, NULL),
        ('게맛살', cat_seafood, sub_proc_sea, NULL),
        ('참치캔', cat_seafood, sub_proc_sea, NULL),
        ('고등어캔', cat_seafood, sub_proc_sea, NULL),
        ('꽁치캔', cat_seafood, sub_proc_sea, NULL),
        ('연어캔', cat_seafood, sub_proc_sea, NULL),
        ('문어숙회', cat_seafood, sub_proc_sea, NULL),
        ('키조개관자', cat_seafood, sub_proc_sea, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 유제품·계란 (60)
    -- ==========================================================================

    -- 유제품·계란 > 우유·음료 (15)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('우유', cat_dairy, sub_milk, '🥛'),
        ('저지방우유', cat_dairy, sub_milk, NULL),
        ('무지방우유', cat_dairy, sub_milk, NULL),
        ('멸균우유', cat_dairy, sub_milk, NULL),
        ('초코우유', cat_dairy, sub_milk, NULL),
        ('딸기우유', cat_dairy, sub_milk, NULL),
        ('바나나우유', cat_dairy, sub_milk, NULL),
        ('연유', cat_dairy, sub_milk, NULL),
        ('무가당연유', cat_dairy, sub_milk, NULL),
        ('두유', cat_dairy, sub_milk, NULL),
        ('아몬드우유', cat_dairy, sub_milk, NULL),
        ('귀리우유', cat_dairy, sub_milk, NULL),
        ('코코넛밀크', cat_dairy, sub_milk, NULL),
        ('코코넛크림', cat_dairy, sub_milk, NULL),
        ('라이스밀크', cat_dairy, sub_milk, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 유제품·계란 > 치즈 (20)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('모짜렐라', cat_dairy, sub_cheese, '🧀'),
        ('프레시모짜렐라', cat_dairy, sub_cheese, NULL),
        ('부라타', cat_dairy, sub_cheese, NULL),
        ('체다치즈', cat_dairy, sub_cheese, NULL),
        ('슬라이스치즈', cat_dairy, sub_cheese, NULL),
        ('파르메산', cat_dairy, sub_cheese, NULL),
        ('그라나파다노', cat_dairy, sub_cheese, NULL),
        ('페코리노', cat_dairy, sub_cheese, NULL),
        ('크림치즈', cat_dairy, sub_cheese, NULL),
        ('마스카포네', cat_dairy, sub_cheese, NULL),
        ('리코타', cat_dairy, sub_cheese, NULL),
        ('페타치즈', cat_dairy, sub_cheese, NULL),
        ('브리치즈', cat_dairy, sub_cheese, NULL),
        ('카망베르', cat_dairy, sub_cheese, NULL),
        ('고르곤졸라', cat_dairy, sub_cheese, NULL),
        ('블루치즈', cat_dairy, sub_cheese, NULL),
        ('에멘탈', cat_dairy, sub_cheese, NULL),
        ('할루미', cat_dairy, sub_cheese, NULL),
        ('스모크치즈', cat_dairy, sub_cheese, NULL),
        ('퀘소치즈', cat_dairy, sub_cheese, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 유제품·계란 > 요거트·발효유 (8)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('플레인요거트', cat_dairy, sub_yogurt, NULL),
        ('그릭요거트', cat_dairy, sub_yogurt, NULL),
        ('드링크요거트', cat_dairy, sub_yogurt, NULL),
        ('버터밀크', cat_dairy, sub_yogurt, NULL),
        ('케피르', cat_dairy, sub_yogurt, NULL),
        ('라씨', cat_dairy, sub_yogurt, NULL),
        ('스키르', cat_dairy, sub_yogurt, NULL),
        ('과일요거트', cat_dairy, sub_yogurt, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 유제품·계란 > 크림·버터 (10)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('생크림', cat_dairy, sub_cream, NULL),
        ('휘핑크림', cat_dairy, sub_cream, NULL),
        ('사워크림', cat_dairy, sub_cream, NULL),
        ('크렘프레쉬', cat_dairy, sub_cream, NULL),
        ('가염버터', cat_dairy, sub_cream, '🧈'),
        ('무염버터', cat_dairy, sub_cream, NULL),
        ('앵커버터', cat_dairy, sub_cream, NULL),
        ('기버터', cat_dairy, sub_cream, NULL),
        ('마가린', cat_dairy, sub_cream, NULL),
        ('쇼트닝', cat_dairy, sub_cream, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 유제품·계란 > 계란류 (6)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('달걀', cat_dairy, sub_egg, '🥚'),
        ('유정란', cat_dairy, sub_egg, NULL),
        ('계란흰자', cat_dairy, sub_egg, NULL),
        ('계란노른자', cat_dairy, sub_egg, NULL),
        ('메추리알', cat_dairy, sub_egg, NULL),
        ('오리알', cat_dairy, sub_egg, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 곡류·면 (113)
    -- ==========================================================================

    -- 곡류·면 > 쌀·잡곡 (20)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('백미', cat_grain, sub_rice, '🍚'),
        ('현미', cat_grain, sub_rice, NULL),
        ('흑미', cat_grain, sub_rice, NULL),
        ('찹쌀', cat_grain, sub_rice, NULL),
        ('찰현미', cat_grain, sub_rice, NULL),
        ('귀리', cat_grain, sub_rice, NULL),
        ('압맥', cat_grain, sub_rice, NULL),
        ('보리', cat_grain, sub_rice, NULL),
        ('찰보리', cat_grain, sub_rice, NULL),
        ('수수', cat_grain, sub_rice, NULL),
        ('기장', cat_grain, sub_rice, NULL),
        ('조', cat_grain, sub_rice, NULL),
        ('율무', cat_grain, sub_rice, NULL),
        ('퀴노아', cat_grain, sub_rice, NULL),
        ('아마란스', cat_grain, sub_rice, NULL),
        ('불가리', cat_grain, sub_rice, NULL),
        ('쿠스쿠스', cat_grain, sub_rice, NULL),
        ('흑태보리', cat_grain, sub_rice, NULL),
        ('잡곡믹스', cat_grain, sub_rice, NULL),
        ('찹쌀현미', cat_grain, sub_rice, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 가루·전분 (21)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('박력분', cat_grain, sub_flour, NULL),
        ('중력분', cat_grain, sub_flour, NULL),
        ('강력분', cat_grain, sub_flour, NULL),
        ('통밀가루', cat_grain, sub_flour, NULL),
        ('호밀가루', cat_grain, sub_flour, NULL),
        ('옥수수가루', cat_grain, sub_flour, NULL),
        ('쌀가루', cat_grain, sub_flour, NULL),
        ('찹쌀가루', cat_grain, sub_flour, NULL),
        ('감자전분', cat_grain, sub_flour, NULL),
        ('옥수수전분', cat_grain, sub_flour, NULL),
        ('타피오카전분', cat_grain, sub_flour, NULL),
        ('튀김가루', cat_grain, sub_flour, NULL),
        ('부침가루', cat_grain, sub_flour, NULL),
        ('고구마전분', cat_grain, sub_flour, NULL),
        ('빵가루', cat_grain, sub_flour, NULL),
        ('생빵가루', cat_grain, sub_flour, NULL),
        ('아몬드가루', cat_grain, sub_flour, NULL),
        ('코코넛가루', cat_grain, sub_flour, NULL),
        ('콩가루', cat_grain, sub_flour, NULL),
        ('녹두가루', cat_grain, sub_flour, NULL),
        ('메밀가루', cat_grain, sub_flour, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 한국 면 (11)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('소면', cat_grain, sub_kr_noodle, NULL),
        ('중면', cat_grain, sub_kr_noodle, NULL),
        ('잔치국수면', cat_grain, sub_kr_noodle, NULL),
        ('칼국수면', cat_grain, sub_kr_noodle, NULL),
        ('한국우동면', cat_grain, sub_kr_noodle, NULL),
        ('메밀면', cat_grain, sub_kr_noodle, NULL),
        ('쫄면', cat_grain, sub_kr_noodle, NULL),
        ('냉면', cat_grain, sub_kr_noodle, NULL),
        ('잡채당면', cat_grain, sub_kr_noodle, NULL),
        ('당면', cat_grain, sub_kr_noodle, NULL),
        ('비빔면', cat_grain, sub_kr_noodle, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 아시아 면 (10)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('라면사리', cat_grain, sub_asia_noodle, NULL),
        ('유카면', cat_grain, sub_asia_noodle, NULL),
        ('쌀국수', cat_grain, sub_asia_noodle, NULL),
        ('팟타이면', cat_grain, sub_asia_noodle, NULL),
        ('소바', cat_grain, sub_asia_noodle, NULL),
        ('자장면', cat_grain, sub_asia_noodle, NULL),
        ('야끼소바면', cat_grain, sub_asia_noodle, NULL),
        ('곤약면', cat_grain, sub_asia_noodle, NULL),
        ('두부면', cat_grain, sub_asia_noodle, NULL),
        ('라멘생면', cat_grain, sub_asia_noodle, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 파스타·유럽면 (17)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('스파게티', cat_grain, sub_pasta, '🍝'),
        ('링귀니', cat_grain, sub_pasta, NULL),
        ('페투치니', cat_grain, sub_pasta, NULL),
        ('탈리아텔레', cat_grain, sub_pasta, NULL),
        ('펜네', cat_grain, sub_pasta, NULL),
        ('리가토니', cat_grain, sub_pasta, NULL),
        ('푸실리', cat_grain, sub_pasta, NULL),
        ('마카로니', cat_grain, sub_pasta, NULL),
        ('로티니', cat_grain, sub_pasta, NULL),
        ('오르조', cat_grain, sub_pasta, NULL),
        ('라자냐', cat_grain, sub_pasta, NULL),
        ('뇨끼', cat_grain, sub_pasta, NULL),
        ('라비올리', cat_grain, sub_pasta, NULL),
        ('토르텔리니', cat_grain, sub_pasta, NULL),
        ('파파르델레', cat_grain, sub_pasta, NULL),
        ('콩킬리에', cat_grain, sub_pasta, NULL),
        ('파르팔레', cat_grain, sub_pasta, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 빵·시리얼 (22)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('식빵', cat_grain, sub_bread, '🍞'),
        ('통밀식빵', cat_grain, sub_bread, NULL),
        ('바게트', cat_grain, sub_bread, '🥖'),
        ('치아바타', cat_grain, sub_bread, NULL),
        ('포카치아', cat_grain, sub_bread, NULL),
        ('크로와상', cat_grain, sub_bread, '🥐'),
        ('베이글', cat_grain, sub_bread, '🥯'),
        ('잉글리쉬머핀', cat_grain, sub_bread, NULL),
        ('밀또띠아', cat_grain, sub_bread, NULL),
        ('옥수수또띠아', cat_grain, sub_bread, NULL),
        ('피타', cat_grain, sub_bread, NULL),
        ('난', cat_grain, sub_bread, NULL),
        ('햄버거번', cat_grain, sub_bread, NULL),
        ('핫도그번', cat_grain, sub_bread, NULL),
        ('모닝빵', cat_grain, sub_bread, NULL),
        ('호밀빵', cat_grain, sub_bread, NULL),
        ('사워도우', cat_grain, sub_bread, NULL),
        ('브리오슈', cat_grain, sub_bread, NULL),
        ('프레첼', cat_grain, sub_bread, NULL),
        ('오트밀', cat_grain, sub_bread, NULL),
        ('그래놀라', cat_grain, sub_bread, NULL),
        ('뮤즐리', cat_grain, sub_bread, NULL),
        ('콘플레이크', cat_grain, sub_bread, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 곡류·면 > 떡 (12)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('가래떡', cat_grain, sub_tteok, NULL),
        ('떡볶이떡', cat_grain, sub_tteok, NULL),
        ('절편', cat_grain, sub_tteok, NULL),
        ('인절미', cat_grain, sub_tteok, NULL),
        ('찹쌀떡', cat_grain, sub_tteok, NULL),
        ('백설기', cat_grain, sub_tteok, NULL),
        ('시루떡', cat_grain, sub_tteok, NULL),
        ('송편', cat_grain, sub_tteok, NULL),
        ('경단', cat_grain, sub_tteok, NULL),
        ('쑥떡', cat_grain, sub_tteok, NULL),
        ('꿀떡', cat_grain, sub_tteok, NULL),
        ('영양찰떡', cat_grain, sub_tteok, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 양념·소스 (213)
    -- ==========================================================================

    -- 양념·소스 > 기본조미 (22)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('소금', cat_sauce, sub_basic, '🧂'),
        ('천일염', cat_sauce, sub_basic, NULL),
        ('꽃소금', cat_sauce, sub_basic, NULL),
        ('맛소금', cat_sauce, sub_basic, NULL),
        ('허브솔트', cat_sauce, sub_basic, NULL),
        ('암염', cat_sauce, sub_basic, NULL),
        ('백설탕', cat_sauce, sub_basic, NULL),
        ('황설탕', cat_sauce, sub_basic, NULL),
        ('흑설탕', cat_sauce, sub_basic, NULL),
        ('알룰로스', cat_sauce, sub_basic, NULL),
        ('자일리톨', cat_sauce, sub_basic, NULL),
        ('스테비아', cat_sauce, sub_basic, NULL),
        ('에리스리톨', cat_sauce, sub_basic, NULL),
        ('꿀', cat_sauce, sub_basic, '🍯'),
        ('조청', cat_sauce, sub_basic, NULL),
        ('물엿', cat_sauce, sub_basic, NULL),
        ('올리고당', cat_sauce, sub_basic, NULL),
        ('메이플시럽', cat_sauce, sub_basic, NULL),
        ('아가베시럽', cat_sauce, sub_basic, NULL),
        ('MSG', cat_sauce, sub_basic, NULL),
        ('다시다(소고기)', cat_sauce, sub_basic, NULL),
        ('다시다(해물)', cat_sauce, sub_basic, NULL),
        ('치킨스톡', cat_sauce, sub_basic, NULL),
        ('야채스톡', cat_sauce, sub_basic, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 간장·장류 (23)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('국간장', cat_sauce, sub_jang, NULL),
        ('진간장', cat_sauce, sub_jang, NULL),
        ('양조간장', cat_sauce, sub_jang, NULL),
        ('조림간장', cat_sauce, sub_jang, NULL),
        ('맛간장', cat_sauce, sub_jang, NULL),
        ('어간장', cat_sauce, sub_jang, NULL),
        ('쯔유', cat_sauce, sub_jang, NULL),
        ('일본식간장', cat_sauce, sub_jang, NULL),
        ('된장', cat_sauce, sub_jang, NULL),
        ('막장', cat_sauce, sub_jang, NULL),
        ('쌈장', cat_sauce, sub_jang, NULL),
        ('춘장', cat_sauce, sub_jang, NULL),
        ('청국장', cat_sauce, sub_jang, NULL),
        ('고추장', cat_sauce, sub_jang, NULL),
        ('초고추장', cat_sauce, sub_jang, NULL),
        ('매실고추장', cat_sauce, sub_jang, NULL),
        ('하선장', cat_sauce, sub_jang, NULL),
        ('두반장', cat_sauce, sub_jang, NULL),
        ('피쉬소스', cat_sauce, sub_jang, NULL),
        ('굴소스', cat_sauce, sub_jang, NULL),
        ('해선장', cat_sauce, sub_jang, NULL),
        ('낫토', cat_sauce, sub_jang, NULL),
        ('약고추장', cat_sauce, sub_jang, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 식초·드레싱 (22)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('현미식초', cat_sauce, sub_vinegar, NULL),
        ('사과식초', cat_sauce, sub_vinegar, NULL),
        ('발사믹식초', cat_sauce, sub_vinegar, NULL),
        ('레드와인식초', cat_sauce, sub_vinegar, NULL),
        ('화이트와인식초', cat_sauce, sub_vinegar, NULL),
        ('쌀식초', cat_sauce, sub_vinegar, NULL),
        ('양조식초', cat_sauce, sub_vinegar, NULL),
        ('흑초', cat_sauce, sub_vinegar, NULL),
        ('라즈베리식초', cat_sauce, sub_vinegar, NULL),
        ('감식초', cat_sauce, sub_vinegar, NULL),
        ('오미자식초', cat_sauce, sub_vinegar, NULL),
        ('이탈리안드레싱', cat_sauce, sub_vinegar, NULL),
        ('시저드레싱', cat_sauce, sub_vinegar, NULL),
        ('오리엔탈드레싱', cat_sauce, sub_vinegar, NULL),
        ('참깨드레싱', cat_sauce, sub_vinegar, NULL),
        ('유자드레싱', cat_sauce, sub_vinegar, NULL),
        ('발사믹드레싱', cat_sauce, sub_vinegar, NULL),
        ('랜치드레싱', cat_sauce, sub_vinegar, NULL),
        ('프렌치드레싱', cat_sauce, sub_vinegar, NULL),
        ('사우전드아일랜드', cat_sauce, sub_vinegar, NULL),
        ('요거트드레싱', cat_sauce, sub_vinegar, NULL),
        ('고추장드레싱', cat_sauce, sub_vinegar, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 오일·기름 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('참기름', cat_sauce, sub_oil, NULL),
        ('들기름', cat_sauce, sub_oil, NULL),
        ('식용유', cat_sauce, sub_oil, NULL),
        ('카놀라유', cat_sauce, sub_oil, NULL),
        ('해바라기유', cat_sauce, sub_oil, NULL),
        ('포도씨유', cat_sauce, sub_oil, NULL),
        ('올리브유', cat_sauce, sub_oil, '🫒'),
        ('엑스트라버진올리브유', cat_sauce, sub_oil, NULL),
        ('코코넛오일', cat_sauce, sub_oil, NULL),
        ('아보카도오일', cat_sauce, sub_oil, NULL),
        ('현미유', cat_sauce, sub_oil, NULL),
        ('땅콩기름', cat_sauce, sub_oil, NULL),
        ('홍화씨유', cat_sauce, sub_oil, NULL),
        ('아마씨유', cat_sauce, sub_oil, NULL),
        ('트러플오일', cat_sauce, sub_oil, NULL),
        ('고추기름', cat_sauce, sub_oil, NULL),
        ('라드', cat_sauce, sub_oil, NULL),
        ('우지', cat_sauce, sub_oil, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 가루양념·향신료 (42)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('고춧가루(고운)', cat_sauce, sub_spice, NULL),
        ('고춧가루(굵은)', cat_sauce, sub_spice, NULL),
        ('청양고춧가루', cat_sauce, sub_spice, NULL),
        ('파프리카파우더', cat_sauce, sub_spice, NULL),
        ('카옌페퍼', cat_sauce, sub_spice, NULL),
        ('흑후추', cat_sauce, sub_spice, NULL),
        ('백후추', cat_sauce, sub_spice, NULL),
        ('통흑후추', cat_sauce, sub_spice, NULL),
        ('통백후추', cat_sauce, sub_spice, NULL),
        ('핑크페퍼콘', cat_sauce, sub_spice, NULL),
        ('스촨페퍼콘', cat_sauce, sub_spice, NULL),
        ('마늘가루', cat_sauce, sub_spice, NULL),
        ('양파가루', cat_sauce, sub_spice, NULL),
        ('생강가루', cat_sauce, sub_spice, NULL),
        ('셀러리솔트', cat_sauce, sub_spice, NULL),
        ('카레가루', cat_sauce, sub_spice, NULL),
        ('인도커리파우더', cat_sauce, sub_spice, NULL),
        ('가람마살라', cat_sauce, sub_spice, NULL),
        ('큐민가루', cat_sauce, sub_spice, NULL),
        ('큐민시드', cat_sauce, sub_spice, NULL),
        ('강황', cat_sauce, sub_spice, NULL),
        ('정향가루', cat_sauce, sub_spice, NULL),
        ('통정향', cat_sauce, sub_spice, NULL),
        ('시나몬가루', cat_sauce, sub_spice, NULL),
        ('시나몬스틱', cat_sauce, sub_spice, NULL),
        ('육두구', cat_sauce, sub_spice, NULL),
        ('메이스', cat_sauce, sub_spice, NULL),
        ('올스파이스', cat_sauce, sub_spice, NULL),
        ('팔각', cat_sauce, sub_spice, NULL),
        ('아니스씨', cat_sauce, sub_spice, NULL),
        ('회향씨', cat_sauce, sub_spice, NULL),
        ('사프란', cat_sauce, sub_spice, NULL),
        ('카더멈', cat_sauce, sub_spice, NULL),
        ('고수씨', cat_sauce, sub_spice, NULL),
        ('고수가루', cat_sauce, sub_spice, NULL),
        ('머스타드파우더', cat_sauce, sub_spice, NULL),
        ('머스타드씨', cat_sauce, sub_spice, NULL),
        ('참깨', cat_sauce, sub_spice, NULL),
        ('흑임자', cat_sauce, sub_spice, NULL),
        ('들깨', cat_sauce, sub_spice, NULL),
        ('들깨가루', cat_sauce, sub_spice, NULL),
        ('후리카케', cat_sauce, sub_spice, NULL),
        ('김가루', cat_sauce, sub_spice, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 액체양념 (15)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('미림', cat_sauce, sub_liquid, NULL),
        ('맛술', cat_sauce, sub_liquid, NULL),
        ('요리용청주', cat_sauce, sub_liquid, NULL),
        ('요리용화이트와인', cat_sauce, sub_liquid, NULL),
        ('매실청', cat_sauce, sub_liquid, NULL),
        ('유자청', cat_sauce, sub_liquid, NULL),
        ('모과청', cat_sauce, sub_liquid, NULL),
        ('스리라차', cat_sauce, sub_liquid, NULL),
        ('타바스코', cat_sauce, sub_liquid, NULL),
        ('핫소스', cat_sauce, sub_liquid, NULL),
        ('우스터소스', cat_sauce, sub_liquid, NULL),
        ('데리야끼소스', cat_sauce, sub_liquid, NULL),
        ('연두', cat_sauce, sub_liquid, NULL),
        ('불닭소스', cat_sauce, sub_liquid, NULL),
        ('간장게장소스', cat_sauce, sub_liquid, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 상업소스 (27)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('케첩', cat_sauce, sub_commercial, NULL),
        ('마요네즈', cat_sauce, sub_commercial, NULL),
        ('고소한마요네즈', cat_sauce, sub_commercial, NULL),
        ('칠리마요', cat_sauce, sub_commercial, NULL),
        ('옐로머스타드', cat_sauce, sub_commercial, NULL),
        ('디종머스타드', cat_sauce, sub_commercial, NULL),
        ('홀그레인머스타드', cat_sauce, sub_commercial, NULL),
        ('허니머스타드', cat_sauce, sub_commercial, NULL),
        ('돈까스소스', cat_sauce, sub_commercial, NULL),
        ('불고기소스', cat_sauce, sub_commercial, NULL),
        ('찜닭소스', cat_sauce, sub_commercial, NULL),
        ('갈비양념', cat_sauce, sub_commercial, NULL),
        ('스테이크소스', cat_sauce, sub_commercial, NULL),
        ('스위트칠리소스', cat_sauce, sub_commercial, NULL),
        ('마라탕소스', cat_sauce, sub_commercial, NULL),
        ('훠궈소스', cat_sauce, sub_commercial, NULL),
        ('카레소스(완제)', cat_sauce, sub_commercial, NULL),
        ('하이라이스소스', cat_sauce, sub_commercial, NULL),
        ('짜장소스', cat_sauce, sub_commercial, NULL),
        ('짬뽕소스', cat_sauce, sub_commercial, NULL),
        ('볶음밥소스', cat_sauce, sub_commercial, NULL),
        ('피자소스', cat_sauce, sub_commercial, NULL),
        ('스파게티소스', cat_sauce, sub_commercial, NULL),
        ('알프레도소스', cat_sauce, sub_commercial, NULL),
        ('바질페스토', cat_sauce, sub_commercial, NULL),
        ('타르타르소스', cat_sauce, sub_commercial, NULL),
        ('칵테일소스', cat_sauce, sub_commercial, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 양념·소스 > 건조허브·향신잎 (12)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('말린바질', cat_sauce, sub_dried_herb, NULL),
        ('말린오레가노', cat_sauce, sub_dried_herb, NULL),
        ('말린타임', cat_sauce, sub_dried_herb, NULL),
        ('말린로즈마리', cat_sauce, sub_dried_herb, NULL),
        ('말린세이지', cat_sauce, sub_dried_herb, NULL),
        ('말린민트', cat_sauce, sub_dried_herb, NULL),
        ('말린고수잎', cat_sauce, sub_dried_herb, NULL),
        ('이탈리안허브믹스', cat_sauce, sub_dried_herb, NULL),
        ('프로방스허브', cat_sauce, sub_dried_herb, NULL),
        ('통월계수잎', cat_sauce, sub_dried_herb, NULL),
        ('건조카피르라임잎', cat_sauce, sub_dried_herb, NULL),
        ('말린딜시드', cat_sauce, sub_dried_herb, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- ==========================================================================
    -- 기타 (64)
    -- ==========================================================================

    -- 기타 > 음료·주류 (21) — 양념으로 쓰이는 와인·청주는 양념·소스 섹션에 이미 있음
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('요리용맥주', cat_misc, sub_drink, '🍺'),
        ('흑맥주', cat_misc, sub_drink, NULL),
        ('청주', cat_misc, sub_drink, NULL),
        ('사케', cat_misc, sub_drink, NULL),
        ('럼(화이트)', cat_misc, sub_drink, NULL),
        ('럼(다크)', cat_misc, sub_drink, NULL),
        ('브랜디', cat_misc, sub_drink, NULL),
        ('보드카', cat_misc, sub_drink, NULL),
        ('위스키', cat_misc, sub_drink, NULL),
        ('요리용소주', cat_misc, sub_drink, NULL),
        ('데킬라', cat_misc, sub_drink, NULL),
        ('커피(원두)', cat_misc, sub_drink, '☕'),
        ('에스프레소', cat_misc, sub_drink, NULL),
        ('인스턴트커피', cat_misc, sub_drink, NULL),
        ('녹차', cat_misc, sub_drink, '🍵'),
        ('말차가루', cat_misc, sub_drink, NULL),
        ('홍차', cat_misc, sub_drink, NULL),
        ('얼그레이', cat_misc, sub_drink, NULL),
        ('우롱차', cat_misc, sub_drink, NULL),
        ('코코아파우더', cat_misc, sub_drink, NULL),
        ('핫초코믹스', cat_misc, sub_drink, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 기타 > 가공식품·캔 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('참치캔(기름)', cat_misc, sub_canned, NULL),
        ('참치캔(물)', cat_misc, sub_canned, NULL),
        ('옥수수캔', cat_misc, sub_canned, NULL),
        ('스위트콘캔', cat_misc, sub_canned, NULL),
        ('파인애플캔', cat_misc, sub_canned, NULL),
        ('황도캔', cat_misc, sub_canned, NULL),
        ('백도캔', cat_misc, sub_canned, NULL),
        ('체리캔', cat_misc, sub_canned, NULL),
        ('토마토홀', cat_misc, sub_canned, NULL),
        ('토마토다이스드', cat_misc, sub_canned, NULL),
        ('토마토소스캔', cat_misc, sub_canned, NULL),
        ('토마토페이스트', cat_misc, sub_canned, NULL),
        ('토마토퓨레', cat_misc, sub_canned, NULL),
        ('죽순통조림', cat_misc, sub_canned, NULL),
        ('양송이캔', cat_misc, sub_canned, NULL),
        ('그린올리브(병)', cat_misc, sub_canned, NULL),
        ('블랙올리브(병)', cat_misc, sub_canned, NULL),
        ('할라페뇨(병)', cat_misc, sub_canned, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 기타 > 베이킹재료 (18)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('베이킹파우더', cat_misc, sub_baking, NULL),
        ('베이킹소다', cat_misc, sub_baking, NULL),
        ('생이스트', cat_misc, sub_baking, NULL),
        ('인스턴트이스트', cat_misc, sub_baking, NULL),
        ('바닐라익스트랙트', cat_misc, sub_baking, NULL),
        ('아몬드익스트랙트', cat_misc, sub_baking, NULL),
        ('초코칩', cat_misc, sub_baking, NULL),
        ('다크초콜릿', cat_misc, sub_baking, NULL),
        ('밀크초콜릿', cat_misc, sub_baking, NULL),
        ('화이트초콜릿', cat_misc, sub_baking, NULL),
        ('카카오닙스', cat_misc, sub_baking, NULL),
        ('식용색소', cat_misc, sub_baking, NULL),
        ('판젤라틴', cat_misc, sub_baking, NULL),
        ('가루젤라틴', cat_misc, sub_baking, NULL),
        ('한천가루', cat_misc, sub_baking, NULL),
        ('펙틴', cat_misc, sub_baking, NULL),
        ('타피오카펄', cat_misc, sub_baking, NULL),
        ('슈가파우더', cat_misc, sub_baking, NULL),
        ('바닐라빈', cat_misc, sub_baking, NULL)
    ON CONFLICT (name) DO NOTHING;

    -- 기타 > 기타 잡화 (5)
    INSERT INTO ingredients (name, category_id, subcategory_id, emoji) VALUES
        ('각얼음', cat_misc, sub_misc_item, '🧊'),
        ('탄산수', cat_misc, sub_misc_item, NULL),
        ('정제수', cat_misc, sub_misc_item, NULL),
        ('사이다', cat_misc, sub_misc_item, NULL),
        ('콜라', cat_misc, sub_misc_item, NULL)
    ON CONFLICT (name) DO NOTHING;

END $$;

-- ==========================================================================
-- 동의어 섹션
-- ==========================================================================

INSERT INTO ingredient_synonyms (ingredient_id, synonym) VALUES
    -- 채소
    ((SELECT id FROM ingredients WHERE name='알타리무'), '총각무'),
    ((SELECT id FROM ingredients WHERE name='래디시'), '적무'),
    ((SELECT id FROM ingredients WHERE name='미니당근'), '베이비캐럿'),
    ((SELECT id FROM ingredients WHERE name='당근'), '홍당무'),
    ((SELECT id FROM ingredients WHERE name='쥬키니호박'), '주키니'),
    ((SELECT id FROM ingredients WHERE name='버터넛스쿼시'), '땅콩호박'),
    ((SELECT id FROM ingredients WHERE name='미니옥수수'), '베이비콘'),
    ((SELECT id FROM ingredients WHERE name='새송이버섯'), '킹옵스터머쉬룸'),
    ((SELECT id FROM ingredients WHERE name='잎새버섯'), '마이타케'),
    ((SELECT id FROM ingredients WHERE name='송로버섯'), '트러플'),
    ((SELECT id FROM ingredients WHERE name='병아리콩'), '가르반조'),
    ((SELECT id FROM ingredients WHERE name='에다마메'), '풋콩'),
    ((SELECT id FROM ingredients WHERE name='돼지감자'), '뚱딴지'),
    ((SELECT id FROM ingredients WHERE name='호스래디시'), '서양고추냉이'),
    ((SELECT id FROM ingredients WHERE name='와사비'), '고추냉이'),
    ((SELECT id FROM ingredients WHERE name='강황'), '터메릭'),
    ((SELECT id FROM ingredients WHERE name='공심채'), '모닝글로리'),
    ((SELECT id FROM ingredients WHERE name='자소엽'), '시소'),
    ((SELECT id FROM ingredients WHERE name='방울양배추'), '브뤼셀스프라우트'),
    ((SELECT id FROM ingredients WHERE name='적양배추'), '적채'),
    ((SELECT id FROM ingredients WHERE name='워터크레스'), '물냉이'),
    ((SELECT id FROM ingredients WHERE name='다채'), '비타민'),

    -- 해산물
    ((SELECT id FROM ingredients WHERE name='가쓰오부시'), '가쯔오부시'),
    ((SELECT id FROM ingredients WHERE name='가쓰오부시'), '가츠오부시'),
    ((SELECT id FROM ingredients WHERE name='주꾸미'), '쭈꾸미'),
    ((SELECT id FROM ingredients WHERE name='광어'), '넙치'),
    ((SELECT id FROM ingredients WHERE name='참돔'), '도미'),
    ((SELECT id FROM ingredients WHERE name='열기'), '볼락'),
    ((SELECT id FROM ingredients WHERE name='성게알'), '우니'),
    ((SELECT id FROM ingredients WHERE name='맛살'), '크래미'),

    -- 곡류
    ((SELECT id FROM ingredients WHERE name='압맥'), '납작귀리'),
    ((SELECT id FROM ingredients WHERE name='생빵가루'), '팡코'),

    -- 유제품
    ((SELECT id FROM ingredients WHERE name='모짜렐라'), '모차렐라'),
    ((SELECT id FROM ingredients WHERE name='파르메산'), '파르미지아노'),
    ((SELECT id FROM ingredients WHERE name='기버터'), '정제버터'),

    -- 과일
    ((SELECT id FROM ingredients WHERE name='청사과'), '그래니스미스'),
    ((SELECT id FROM ingredients WHERE name='키위'), '그린키위'),

    -- 양념
    ((SELECT id FROM ingredients WHERE name='사과식초'), '애플사이다비네거'),
    ((SELECT id FROM ingredients WHERE name='사과식초'), 'ACV'),
    ((SELECT id FROM ingredients WHERE name='엑스트라버진올리브유'), '엑버'),
    ((SELECT id FROM ingredients WHERE name='팔각'), '스타아니스'),
    ((SELECT id FROM ingredients WHERE name='회향씨'), '펜넬씨드'),
    ((SELECT id FROM ingredients WHERE name='육두구'), '너트메그'),
    ((SELECT id FROM ingredients WHERE name='고수씨'), '코리앤더시드'),
    ((SELECT id FROM ingredients WHERE name='스촨페퍼콘'), '화자오'),
    ((SELECT id FROM ingredients WHERE name='피쉬소스'), '남플라'),
    ((SELECT id FROM ingredients WHERE name='미림'), '미린'),
    ((SELECT id FROM ingredients WHERE name='다시다(소고기)'), '소다시다'),
    ((SELECT id FROM ingredients WHERE name='다시다(해물)'), '해물다시다'),
    ((SELECT id FROM ingredients WHERE name='MSG'), '미원'),
    ((SELECT id FROM ingredients WHERE name='바질페스토'), '페스토'),
    ((SELECT id FROM ingredients WHERE name='흑임자'), '검은참깨'),

    -- 기타
    ((SELECT id FROM ingredients WHERE name='옐로머스타드'), '머스타드'),
    ((SELECT id FROM ingredients WHERE name='정제수'), '생수');
