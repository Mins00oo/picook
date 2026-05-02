-- =============================================
-- 시드: 관리자 계정 + 기본 의상 카탈로그
--
-- 카테고리/서브카테고리/재료/레시피는 백오피스 picook_seed.xlsx 업로드로 들어감
-- (SeedImportService 가 categories/subcategories/ingredients/... 시트 처리).
-- 여기는 백오피스 로그인 자체에 필요한 admin 1건과,
-- UserLevelService 가 레벨업 시 조회하는 기본 의상 7건만 둠.
-- =============================================

-- 관리자 (비밀번호: bcrypt cost 12)
INSERT INTO admin_users (email, password_hash, role)
VALUES (
    'admin@picook.com',
    '$2a$12$u7fGjxySVo8jxkjatfjqp.5AGIMaxhZJyZ5hnFQCGeMZl5BSKBDcK',
    'SUPER_ADMIN'
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;


-- 기본 의상 7건 (Lv.1 기본 세트 + Lv.3 / Lv.5 / Lv.7 레벨 보상)
INSERT INTO outfits (slot, name, description, image_url, price_points, unlock_level, is_default, sort_order) VALUES
    ('top',       '앞치마',     '신규 요리사 기본 앞치마',   '/outfits/apron_default.png', 0, 1, TRUE,  1),
    ('rightHand', '나무 주걱',  '기본 조리 도구',             '/outfits/spoon_wood.png',    0, 1, TRUE,  2),
    ('head',      '요리 모자',  'Lv.3 달성 기념',             '/outfits/chef_hat.png',      0, 3, FALSE, 3),
    ('leftHand',  '프라이팬',   'Lv.5 달성 기념',             '/outfits/frypan.png',        0, 5, FALSE, 4),
    ('rightHand', '뒤집개',     'Lv.5 달성 기념',             '/outfits/spatula.png',       0, 5, FALSE, 5),
    ('top',       '셰프 상의',  'Lv.7 달성 기념',             '/outfits/chef_top.png',      0, 7, FALSE, 6),
    ('bottom',    '셰프 하의',  'Lv.7 달성 기념',             '/outfits/chef_bottom.png',   0, 7, FALSE, 7);
