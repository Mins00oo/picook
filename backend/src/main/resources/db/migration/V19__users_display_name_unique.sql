-- V19: 닉네임(display_name) 중복 방지
-- - PostgreSQL UNIQUE는 NULL을 서로 다른 값으로 취급하므로, 닉네임 미설정(NULL) 유저는 영향 없음.
-- - 동일 닉네임이 이미 DB에 있다면 이 마이그레이션이 실패하므로, 필요 시 수동 정리 후 재적용.

ALTER TABLE users
    ADD CONSTRAINT uq_users_display_name UNIQUE (display_name);
