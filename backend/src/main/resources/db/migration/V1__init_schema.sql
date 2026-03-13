-- =============================================
-- Picook MVP Schema
-- PostgreSQL 15
-- =============================================

-- 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    display_name VARCHAR(50),
    profile_image_url TEXT,
    login_type VARCHAR(20) NOT NULL CHECK (login_type IN ('kakao', 'apple')),
    kakao_id VARCHAR(100),
    apple_id VARCHAR(100),
    cooking_level VARCHAR(20) DEFAULT 'beginner'
        CHECK (cooking_level IN ('beginner', 'easy', 'intermediate', 'advanced')),
    coaching_enabled BOOLEAN DEFAULT TRUE,
    coaching_voice_speed DECIMAL(2,1) DEFAULT 1.0,
    completed_cooking_count INT DEFAULT 0,
    is_onboarded BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deleted')),
    suspended_reason TEXT,
    deleted_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재료 카테고리
CREATE TABLE ingredient_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재료
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT REFERENCES ingredient_categories(id),
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재료 동의어
CREATE TABLE ingredient_synonyms (
    id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    synonym VARCHAR(100) NOT NULL
);

-- 레시피
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('korean','western','chinese','japanese','snack','dessert','drink','other')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    cooking_time_minutes INT NOT NULL,
    servings INT NOT NULL DEFAULT 2,
    image_url TEXT,
    thumbnail_url TEXT,
    tips TEXT,
    total_ingredients INT DEFAULT 0,
    view_count INT DEFAULT 0,
    coaching_ready BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','hidden')),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 레시피-재료 매핑
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id),
    amount DECIMAL(10,2),
    unit VARCHAR(20),
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- 레시피 조리 단계
CREATE TABLE recipe_steps (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    step_type VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (step_type IN ('active','wait')),
    duration_seconds INT NOT NULL,
    can_parallel BOOLEAN DEFAULT TRUE
);

-- 즐겨찾기
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- 피드백
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('delicious','okay','difficult')),
    comment TEXT,
    admin_status VARCHAR(20) DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- 검색 기록
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_ids INT[] NOT NULL,
    filters JSONB,
    result_count INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코칭 로그
CREATE TABLE coaching_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('single','multi')),
    recipe_ids INT[] NOT NULL,
    estimated_seconds INT,
    actual_seconds INT,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 요리 완료 (사진 업로드)
CREATE TABLE cooking_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT,
    coaching_log_id INT REFERENCES coaching_logs(id),
    photo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 쇼츠 캐시
CREATE TABLE shorts_cache (
    id SERIAL PRIMARY KEY,
    youtube_url VARCHAR(500) NOT NULL,
    url_hash VARCHAR(64) NOT NULL UNIQUE,
    ai_model_version VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    thumbnail_url TEXT,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'content_admin'
        CHECK (role IN ('super_admin','content_admin','viewer')),
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    failed_login_count INT DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일별 통계
CREATE TABLE daily_stats (
    date DATE PRIMARY KEY,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_searches INT DEFAULT 0,
    total_recipe_views INT DEFAULT 0,
    total_coaching_sessions INT DEFAULT 0,
    coaching_completions INT DEFAULT 0,
    total_shorts_conversions INT DEFAULT 0
);

-- =============================================
-- Indexes
-- =============================================

-- users
CREATE INDEX idx_users_login_type ON users(login_type);
CREATE INDEX idx_users_kakao_id ON users(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);

-- ingredients
CREATE INDEX idx_ingredients_category_id ON ingredients(category_id);

-- ingredient_synonyms
CREATE INDEX idx_ingredient_synonyms_ingredient_id ON ingredient_synonyms(ingredient_id);

-- recipes
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_coaching_ready ON recipes(coaching_ready);
CREATE INDEX idx_recipes_is_deleted ON recipes(is_deleted);

-- recipe_ingredients
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- recipe_steps
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

-- favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- feedback
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_recipe_id ON feedback(recipe_id);
CREATE INDEX idx_feedback_admin_status ON feedback(admin_status);

-- search_history
CREATE INDEX idx_search_history_user_id ON search_history(user_id);

-- coaching_logs
CREATE INDEX idx_coaching_logs_user_id ON coaching_logs(user_id);

-- cooking_completions
CREATE INDEX idx_cooking_completions_user_id ON cooking_completions(user_id);

-- shorts_cache
CREATE INDEX idx_shorts_cache_url_hash ON shorts_cache(url_hash);

-- admin_users
CREATE INDEX idx_admin_users_email ON admin_users(email);
