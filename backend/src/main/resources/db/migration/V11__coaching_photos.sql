-- 코칭 완료 사진 다중 업로드 지원
CREATE TABLE coaching_photos (
    id SERIAL PRIMARY KEY,
    coaching_log_id INT NOT NULL REFERENCES coaching_logs(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaching_photos_log_id ON coaching_photos(coaching_log_id);

-- 기존 cooking_completions의 사진 데이터를 coaching_photos로 마이그레이션
INSERT INTO coaching_photos (coaching_log_id, photo_url, display_order)
SELECT coaching_log_id, photo_url, 0
FROM cooking_completions
WHERE photo_url IS NOT NULL;
