-- V14: 포인트 시스템 (계란 포인트)
-- users.point_balance: 현재 잔액 (O(1) 조회)
-- point_ledger: 적립/사용 내역

ALTER TABLE users ADD COLUMN point_balance INTEGER NOT NULL DEFAULT 0;

CREATE TABLE point_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- signed: +적립, -사용
    reason VARCHAR(30) NOT NULL, -- DAILY_CHECK, COOKBOOK_ENTRY, SHOP_PURCHASE 등
    ref_type VARCHAR(30), -- ATTENDANCE, COOKBOOK 등 참조 리소스 종류
    ref_id BIGINT, -- 참조 리소스 ID
    balance_after INTEGER NOT NULL, -- 적용 후 잔액 (감사용)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_point_ledger_user_id_created_at ON point_ledger(user_id, created_at DESC);
