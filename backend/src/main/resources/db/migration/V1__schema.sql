-- =============================================
-- Picook 스키마 (Baseline)
-- PostgreSQL 15
--
-- 이 파일 하나가 V1~V28의 누적 결과를 담은 최종 DDL.
-- 폐기된 기능(코칭/쇼츠) 및 미사용 테이블(daily_stats)은 포함하지 않음.
-- 시드(관리자/의상)는 V2 에서 분리. 카테고리·재료·레시피는 백오피스 엑셀 업로드.
-- =============================================


-- =============================================
-- USER / AUTH
-- =============================================

-- 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    -- 사용자가 직접 정한 앱 닉네임. UNIQUE (NULL 다중 허용)
    display_name VARCHAR(50),
    -- 카카오/Apple이 준 원본 이름. setup 화면 placeholder 용
    oauth_name VARCHAR(50),
    profile_image_url TEXT,
    login_type VARCHAR(20) NOT NULL CHECK (login_type IN ('KAKAO', 'APPLE')),
    kakao_id VARCHAR(100),
    apple_id VARCHAR(100),
    -- 캐릭터 타입 (MIN / ROO / HARU)
    character_type VARCHAR(20),
    completed_cooking_count INT DEFAULT 0,
    -- 누적 경험치 (레벨 산정 기준)
    total_exp BIGINT NOT NULL DEFAULT 0,
    point_balance INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    suspended_reason TEXT,
    deleted_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_users_display_name UNIQUE (display_name)
);

CREATE INDEX idx_users_login_type ON users(login_type);
CREATE INDEX idx_users_kakao_id ON users(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);


-- 관리자
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CONTENT_ADMIN'
        CHECK (role IN ('SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER')),
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    failed_login_count INT DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);


-- =============================================
-- INGREDIENT (카테고리 / 서브카테고리 / 재료 / 동의어 / 단위환산)
-- =============================================

CREATE TABLE ingredient_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    emoji VARCHAR(8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


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


CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT REFERENCES ingredient_categories(id),
    subcategory_id INT REFERENCES ingredient_subcategories(id),
    icon_url TEXT,
    emoji VARCHAR(8),
    -- 추천 매칭률 계산에서 제외할 양념 여부
    is_seasoning BOOLEAN NOT NULL DEFAULT FALSE,
    -- 부모 재료 (육류 부위 → 메인). 자식 보유 시 부모 매칭 OK (상향 매칭)
    parent_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingredients_category_id ON ingredients(category_id);
CREATE INDEX idx_ingredients_subcategory ON ingredients(subcategory_id);
CREATE INDEX idx_ingredients_parent ON ingredients(parent_id) WHERE parent_id IS NOT NULL;


CREATE TABLE ingredient_synonyms (
    id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    synonym VARCHAR(100) NOT NULL
);

CREATE INDEX idx_ingredient_synonyms_ingredient_id ON ingredient_synonyms(ingredient_id);


-- 재료별 단위 환산표. 예: 다진마늘 1g = 0.067큰술
CREATE TABLE unit_conversions (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    from_unit VARCHAR(20) NOT NULL,
    to_unit VARCHAR(20) NOT NULL,
    conversion DECIMAL(12, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ingredient_id, from_unit, to_unit)
);

CREATE INDEX idx_unit_conv_ing ON unit_conversions(ingredient_id);


-- =============================================
-- RECIPE
-- =============================================

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('korean','western','chinese','japanese','snack','dessert','drink','other')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    cooking_time_minutes INT NOT NULL,
    servings INT NOT NULL DEFAULT 2,
    calories INTEGER,
    image_url TEXT,
    thumbnail_url TEXT,
    tips TEXT,
    total_ingredients INT DEFAULT 0,
    view_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','hidden')),
    is_deleted BOOLEAN DEFAULT FALSE,
    -- LLM 시간대 분류 (4-period). API 의 midnight 슬롯이 meal_snack 사용
    meal_breakfast BOOLEAN NOT NULL DEFAULT FALSE,
    meal_lunch     BOOLEAN NOT NULL DEFAULT FALSE,
    meal_dinner    BOOLEAN NOT NULL DEFAULT FALSE,
    meal_snack     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_is_deleted ON recipes(is_deleted);

-- 시간대 슬롯별 추천 쿼리용 부분 인덱스
CREATE INDEX idx_recipes_meal_breakfast ON recipes(view_count DESC) WHERE meal_breakfast = TRUE AND is_deleted = FALSE AND status = 'published';
CREATE INDEX idx_recipes_meal_lunch     ON recipes(view_count DESC) WHERE meal_lunch     = TRUE AND is_deleted = FALSE AND status = 'published';
CREATE INDEX idx_recipes_meal_dinner    ON recipes(view_count DESC) WHERE meal_dinner    = TRUE AND is_deleted = FALSE AND status = 'published';
CREATE INDEX idx_recipes_meal_snack     ON recipes(view_count DESC) WHERE meal_snack     = TRUE AND is_deleted = FALSE AND status = 'published';


CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(id),
    amount DECIMAL(10,2),
    unit VARCHAR(20),
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);


CREATE TABLE recipe_steps (
    id SERIAL PRIMARY KEY,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    -- 조리 팁 / 주의사항. UI 에서 💡 별도 표시 가능
    tip TEXT
);

CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);


-- =============================================
-- USER ACTIVITY (즐겨찾기 / 피드백 / 검색기록 / 냉장고)
-- =============================================

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);


-- 피드백 rating/admin_status 는 @Enumerated(EnumType.STRING) → enum name 대문자 저장
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('DELICIOUS','OKAY','DIFFICULT')),
    comment TEXT,
    admin_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (admin_status IN ('PENDING','REVIEWED','RESOLVED')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_recipe_id ON feedback(recipe_id);
CREATE INDEX idx_feedback_admin_status ON feedback(admin_status);


CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_ids INT[] NOT NULL,
    filters JSONB,
    result_count INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);


-- 사용자별 보유 재료 (이진값)
CREATE TABLE user_fridge_ingredients (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ingredient_id)
);

CREATE INDEX idx_user_fridge_user ON user_fridge_ingredients(user_id);


-- =============================================
-- COOKBOOK (요리 완료 인증 — 별점 + 메모 + 사진 최대 4장)
-- =============================================

CREATE TABLE cookbook_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    memo TEXT,
    cooked_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cookbook_entries_user_cooked_at ON cookbook_entries(user_id, cooked_at DESC);
CREATE INDEX idx_cookbook_entries_recipe_id ON cookbook_entries(recipe_id);


CREATE TABLE cookbook_photos (
    id BIGSERIAL PRIMARY KEY,
    cookbook_entry_id BIGINT NOT NULL REFERENCES cookbook_entries(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cookbook_photos_entry ON cookbook_photos(cookbook_entry_id, display_order);


-- =============================================
-- POINT / ATTENDANCE
-- =============================================

CREATE TABLE point_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,         -- signed: + 적립, - 사용
    reason VARCHAR(30) NOT NULL,     -- DAILY_CHECK, COOKBOOK_ENTRY, SHOP_PURCHASE, ADMIN_ADJUST
    ref_type VARCHAR(30),            -- ATTENDANCE, COOKBOOK 등 참조 리소스 종류
    ref_id BIGINT,                   -- 참조 리소스 ID
    balance_after INTEGER NOT NULL,  -- 적용 후 잔액 (감사용)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_ledger_user_id_created_at ON point_ledger(user_id, created_at DESC);


CREATE TABLE attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, check_date)
);

CREATE INDEX idx_attendance_logs_user_date ON attendance_logs(user_id, check_date DESC);


-- =============================================
-- OUTFIT (의상 카탈로그 + 인벤토리 + 장착 + 레벨 보상)
-- =============================================

CREATE TABLE outfits (
    id BIGSERIAL PRIMARY KEY,
    -- head / top / bottom / shoes / leftHand / rightHand
    slot VARCHAR(16) NOT NULL,
    name VARCHAR(60) NOT NULL,
    description VARCHAR(200),
    image_url VARCHAR(500) NOT NULL,
    -- 0 = 비매품 (레벨 보상 전용)
    price_points INTEGER NOT NULL DEFAULT 0,
    -- NULL = 상점 판매 전용. 숫자면 해당 레벨 도달 시 자동 지급
    unlock_level SMALLINT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outfits_unlock_level ON outfits(unlock_level) WHERE unlock_level IS NOT NULL;
CREATE INDEX idx_outfits_slot_active ON outfits(slot) WHERE is_active = TRUE;


CREATE TABLE user_owned_outfits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outfit_id BIGINT NOT NULL REFERENCES outfits(id),
    -- SHOP / LEVEL_REWARD / DEFAULT
    acquired_source VARCHAR(16) NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, outfit_id)
);

CREATE INDEX idx_user_owned_outfits_user ON user_owned_outfits(user_id);


-- 슬롯당 1개 (outfit_id NULL 이면 해제)
CREATE TABLE user_equipped_outfits (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot VARCHAR(16) NOT NULL,
    outfit_id BIGINT REFERENCES outfits(id),
    PRIMARY KEY (user_id, slot)
);


-- 레벨업 보상 지급 로그 (레벨당 1회 보장)
CREATE TABLE level_reward_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, level)
);

CREATE INDEX idx_level_reward_logs_user ON level_reward_logs(user_id);
