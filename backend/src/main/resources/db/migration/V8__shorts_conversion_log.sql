-- V8: 쇼츠 변환 로그 테이블 (성공/실패 + 단계별 소요시간 기록)
CREATE TABLE shorts_conversion_log (
    id              SERIAL PRIMARY KEY,
    user_id         UUID,
    youtube_url     VARCHAR(500) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',  -- SUCCESS, FAILED
    error_code      VARCHAR(50),
    error_message   TEXT,
    cache_hit       BOOLEAN NOT NULL DEFAULT FALSE,
    total_ms        BIGINT,
    extract_ms      BIGINT,
    transcribe_ms   BIGINT,
    structurize_ms  BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shorts_conversion_log_created_at ON shorts_conversion_log(created_at);
CREATE INDEX idx_shorts_conversion_log_status ON shorts_conversion_log(status);
CREATE INDEX idx_shorts_conversion_log_user_id ON shorts_conversion_log(user_id);
