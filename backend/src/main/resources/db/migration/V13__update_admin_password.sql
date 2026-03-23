-- 관리자 기본 비밀번호 변경
UPDATE admin_users
SET password_hash = '$2a$12$u7fGjxySVo8jxkjatfjqp.5AGIMaxhZJyZ5hnFQCGeMZl5BSKBDcK'
WHERE email = 'admin@picook.com';
