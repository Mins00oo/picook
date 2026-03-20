-- 쇼츠 변환 결과 즐겨찾기
CREATE TABLE shorts_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shorts_cache_id INT REFERENCES shorts_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, shorts_cache_id)
);
CREATE INDEX idx_shorts_favorites_user_id ON shorts_favorites(user_id);
