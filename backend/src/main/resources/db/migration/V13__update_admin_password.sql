-- 관리자 테스트 계정 시드 + 비밀번호 갱신
-- (V7 제거에 따라 admin 계정 생성 책임을 여기로 이관)
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@picook.com', '$2a$12$u7fGjxySVo8jxkjatfjqp.5AGIMaxhZJyZ5hnFQCGeMZl5BSKBDcK', 'SUPER_ADMIN')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
