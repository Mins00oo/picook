-- =============================================
-- V7: 개발/테스트용 시드 데이터
-- =============================================

-- 1. 관리자 계정 (SUPER_ADMIN)
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@picook.com', '$2b$12$mOaQBnhJkLy17RxdqZHyA.urwmtsf9HzyIEt/TqrMUaZJ/zd2VJnm', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- 2. 재료 22개 (카테고리별)
INSERT INTO ingredients (name, category_id) VALUES
    -- 채소 (category_id = 1)
    ('양파', 1),
    ('대파', 1),
    ('감자', 1),
    ('당근', 1),
    ('시금치', 1),
    ('김치', 1),
    -- 육류 (category_id = 3)
    ('돼지고기', 3),
    ('닭가슴살', 3),
    ('소고기', 3),
    -- 해산물 (category_id = 4)
    ('새우', 4),
    ('오징어', 4),
    -- 유제품/계란 (category_id = 5)
    ('계란', 5),
    ('우유', 5),
    ('치즈', 5),
    -- 곡류/면 (category_id = 6)
    ('밥', 6),
    -- 양념/소스 (category_id = 7)
    ('간장', 7),
    ('된장', 7),
    ('고추장', 7),
    ('소금', 7),
    ('설탕', 7),
    ('참기름', 7),
    -- 기타 (category_id = 8)
    ('두부', 8)
ON CONFLICT (name) DO NOTHING;

-- 3. 재료 동의어
INSERT INTO ingredient_synonyms (ingredient_id, synonym) VALUES
    ((SELECT id FROM ingredients WHERE name = '계란'), '달걀'),
    ((SELECT id FROM ingredients WHERE name = '대파'), '파'),
    ((SELECT id FROM ingredients WHERE name = '돼지고기'), '돼지'),
    ((SELECT id FROM ingredients WHERE name = '닭가슴살'), '닭고기'),
    ((SELECT id FROM ingredients WHERE name = '소고기'), '쇠고기'),
    ((SELECT id FROM ingredients WHERE name = '참기름'), '들기름'),
    ((SELECT id FROM ingredients WHERE name = '감자'), '알감자'),
    ((SELECT id FROM ingredients WHERE name = '김치'), '배추김치');

-- 4. 레시피 5개 (status=published, lowercase enum)
INSERT INTO recipes (title, category, difficulty, cooking_time_minutes, servings, status, tips, total_ingredients) VALUES
    ('된장찌개', 'korean', 'easy', 20, 2, 'published', '된장은 끓이기 직전에 넣으면 풍미가 좋아요', 5),
    ('계란말이', 'korean', 'easy', 15, 2, 'published', '약한 불에서 천천히 말아야 잘 익어요', 3),
    ('김치볶음밥', 'korean', 'easy', 15, 1, 'published', '김치는 잘 익은 것을 사용하세요', 4),
    ('닭가슴살 샐러드', 'western', 'easy', 10, 1, 'published', '닭가슴살은 삶아서 결대로 찢으면 좋아요', 3),
    ('새우볶음밥', 'korean', 'medium', 20, 2, 'published', '센 불에서 빠르게 볶아야 밥이 안 눅눅해요', 6);

-- 5. 레시피-재료 매핑
-- 된장찌개: 된장, 두부, 양파, 대파, 감자
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_required, sort_order) VALUES
    ((SELECT id FROM recipes WHERE title = '된장찌개'), (SELECT id FROM ingredients WHERE name = '된장'), 1.00, '큰술', true, 1),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), (SELECT id FROM ingredients WHERE name = '두부'), 0.50, '모', true, 2),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), (SELECT id FROM ingredients WHERE name = '양파'), 0.50, '개', true, 3),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), (SELECT id FROM ingredients WHERE name = '대파'), 0.50, '대', true, 4),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), (SELECT id FROM ingredients WHERE name = '감자'), 1.00, '개', true, 5);

-- 계란말이: 계란, 대파, 당근
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_required, sort_order) VALUES
    ((SELECT id FROM recipes WHERE title = '계란말이'), (SELECT id FROM ingredients WHERE name = '계란'), 4.00, '개', true, 1),
    ((SELECT id FROM recipes WHERE title = '계란말이'), (SELECT id FROM ingredients WHERE name = '대파'), 0.50, '대', true, 2),
    ((SELECT id FROM recipes WHERE title = '계란말이'), (SELECT id FROM ingredients WHERE name = '당근'), 0.30, '개', true, 3);

-- 김치볶음밥: 밥, 김치, 계란, 참기름
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_required, sort_order) VALUES
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), (SELECT id FROM ingredients WHERE name = '밥'), 1.00, '공기', true, 1),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), (SELECT id FROM ingredients WHERE name = '김치'), 1.00, '컵', true, 2),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), (SELECT id FROM ingredients WHERE name = '계란'), 1.00, '개', true, 3),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), (SELECT id FROM ingredients WHERE name = '참기름'), 1.00, '큰술', true, 4);

-- 닭가슴살 샐러드: 닭가슴살, 양파, 시금치
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_required, sort_order) VALUES
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), (SELECT id FROM ingredients WHERE name = '닭가슴살'), 1.00, '덩이', true, 1),
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), (SELECT id FROM ingredients WHERE name = '양파'), 0.50, '개', true, 2),
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), (SELECT id FROM ingredients WHERE name = '시금치'), 1.00, '줌', true, 3);

-- 새우볶음밥: 밥, 새우, 계란, 대파, 간장, 참기름
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_required, sort_order) VALUES
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '밥'), 2.00, '공기', true, 1),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '새우'), 10.00, '마리', true, 2),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '계란'), 2.00, '개', true, 3),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '대파'), 0.50, '대', true, 4),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '간장'), 1.00, '큰술', true, 5),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), (SELECT id FROM ingredients WHERE name = '참기름'), 1.00, '큰술', true, 6);

-- 6. 조리 단계 (step_type lowercase, duration_seconds > 0 → 트리거가 coaching_ready 자동 설정)

-- 된장찌개 (6단계)
INSERT INTO recipe_steps (recipe_id, step_number, description, step_type, duration_seconds) VALUES
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 1, '냄비에 물 500ml를 넣고 센 불로 끓인다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 2, '물이 끓으면 된장 1큰술을 풀어넣고 잘 저어준다', 'active', 30),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 3, '양파와 감자를 한입 크기로 썰어 넣는다', 'active', 120),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 4, '감자가 익을 때까지 중불로 끓인다', 'wait', 480),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 5, '두부를 깍둑 썰어 넣고 대파를 송송 썰어 올린다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '된장찌개'), 6, '한소끔 더 끓여 완성한다', 'wait', 120);

-- 계란말이 (5단계)
INSERT INTO recipe_steps (recipe_id, step_number, description, step_type, duration_seconds) VALUES
    ((SELECT id FROM recipes WHERE title = '계란말이'), 1, '계란 4개를 볼에 깨고 소금 약간을 넣어 잘 풀어준다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '계란말이'), 2, '대파와 당근을 잘게 다져 계란물에 섞는다', 'active', 90),
    ((SELECT id FROM recipes WHERE title = '계란말이'), 3, '팬에 기름을 두르고 약한 불로 예열한다', 'active', 30),
    ((SELECT id FROM recipes WHERE title = '계란말이'), 4, '계란물을 1/3씩 부어가며 돌돌 말아준다', 'active', 180),
    ((SELECT id FROM recipes WHERE title = '계란말이'), 5, '불을 끄고 2분간 뜸을 들인 후 한입 크기로 썬다', 'wait', 120);

-- 김치볶음밥 (5단계)
INSERT INTO recipe_steps (recipe_id, step_number, description, step_type, duration_seconds) VALUES
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), 1, '김치를 잘게 썰어 준비한다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), 2, '팬에 참기름을 두르고 김치를 볶는다', 'active', 120),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), 3, '김치가 익으면 밥을 넣고 함께 볶는다', 'active', 180),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), 4, '밥이 고루 섞이면 접시에 담는다', 'active', 30),
    ((SELECT id FROM recipes WHERE title = '김치볶음밥'), 5, '계란 프라이를 올려 완성한다', 'active', 60);

-- 닭가슴살 샐러드 (4단계)
INSERT INTO recipe_steps (recipe_id, step_number, description, step_type, duration_seconds) VALUES
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), 1, '냄비에 물을 끓이고 닭가슴살을 넣어 삶는다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), 2, '닭가슴살이 완전히 익을 때까지 삶는다', 'wait', 600),
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), 3, '삶은 닭가슴살을 결대로 찢고 양파는 얇게 슬라이스한다', 'active', 120),
    ((SELECT id FROM recipes WHERE title = '닭가슴살 샐러드'), 4, '시금치 위에 닭가슴살과 양파를 올리고 드레싱을 뿌린다', 'active', 60);

-- 새우볶음밥 (6단계)
INSERT INTO recipe_steps (recipe_id, step_number, description, step_type, duration_seconds) VALUES
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 1, '새우 껍질을 벗기고 내장을 제거한다', 'active', 120),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 2, '대파를 송송 썰고 계란을 풀어둔다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 3, '팬에 기름을 두르고 새우를 먼저 볶아 꺼낸다', 'active', 120),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 4, '같은 팬에 계란을 스크램블하고 밥을 넣어 볶는다', 'active', 180),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 5, '볶은 새우와 대파를 넣고 간장, 참기름으로 간한다', 'active', 60),
    ((SELECT id FROM recipes WHERE title = '새우볶음밥'), 6, '센 불에서 30초간 마무리 볶아 완성한다', 'active', 30);

-- 7. 테스트 사용자
INSERT INTO users (id, email, display_name, login_type, kakao_id, is_onboarded, cooking_level, coaching_enabled, status)
VALUES (
    gen_random_uuid(),
    'test@picook.com',
    '테스트유저',
    'KAKAO',
    'test_kakao_123',
    true,
    'BEGINNER',
    true,
    'ACTIVE'
);
