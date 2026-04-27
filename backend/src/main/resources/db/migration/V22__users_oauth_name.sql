-- V22: oauth_name 컬럼 추가 (소셜 제공 이름 보관용)
-- - display_name = 사용자가 직접 정한 앱 닉네임 (UNIQUE)
-- - oauth_name   = 카카오/Apple이 준 원본 이름 (중복 허용)
-- 기존 카카오 가입자의 display_name은 oauth_name으로 이관 후 비워서,
-- 사용자가 setup 화면에서 새 닉네임을 정하도록 유도한다.

ALTER TABLE users ADD COLUMN oauth_name VARCHAR(50);

UPDATE users
   SET oauth_name = display_name,
       display_name = NULL
 WHERE display_name IS NOT NULL;
