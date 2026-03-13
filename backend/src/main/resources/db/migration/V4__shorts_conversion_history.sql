CREATE TABLE shorts_conversion_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    shorts_cache_id INTEGER NOT NULL REFERENCES shorts_cache(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shorts_conv_history_user ON shorts_conversion_history(user_id);
CREATE INDEX idx_shorts_conv_history_cache ON shorts_conversion_history(shorts_cache_id);
