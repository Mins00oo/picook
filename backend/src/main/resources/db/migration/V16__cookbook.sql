-- V16: 요리북 (Cookbook) — 사용자가 레시피 완료 후 별점/사진/메모로 기록
-- v1.0에서 coaching_logs 대신 사용 (코칭 기능 자체 제거)

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
