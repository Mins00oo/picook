-- =============================================
-- V6: Fix CHECK constraints to match Java enum uppercase values
-- @Enumerated(EnumType.STRING) stores enum name() which is UPPER_CASE
-- =============================================

-- users.login_type: 'kakao','apple' -> 'KAKAO','APPLE'
ALTER TABLE users DROP CONSTRAINT users_login_type_check;
ALTER TABLE users ADD CONSTRAINT users_login_type_check
    CHECK (login_type IN ('KAKAO', 'APPLE'));

-- users.cooking_level: 'beginner','easy','intermediate','advanced' -> uppercase
ALTER TABLE users DROP CONSTRAINT users_cooking_level_check;
ALTER TABLE users ADD CONSTRAINT users_cooking_level_check
    CHECK (cooking_level IN ('BEGINNER', 'EASY', 'INTERMEDIATE', 'ADVANCED'));
ALTER TABLE users ALTER COLUMN cooking_level SET DEFAULT 'BEGINNER';

-- users.status: 'active','suspended','deleted' -> uppercase
ALTER TABLE users DROP CONSTRAINT users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED'));
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- admin_users.role: 'super_admin','content_admin','viewer' -> uppercase
ALTER TABLE admin_users DROP CONSTRAINT admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check
    CHECK (role IN ('SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'));
ALTER TABLE admin_users ALTER COLUMN role SET DEFAULT 'CONTENT_ADMIN';
