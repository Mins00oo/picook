-- V15: 매일 출석체크
-- UNIQUE(user_id, check_date) 로 중복 체크인 방지

CREATE TABLE attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, check_date)
);

CREATE INDEX idx_attendance_logs_user_date ON attendance_logs(user_id, check_date DESC);
