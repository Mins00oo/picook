-- 코칭 기능 제거에 따른 recipe_steps의 코칭 전용 컬럼 정리
-- step_type(active/wait), duration_seconds, can_parallel은 코칭 모드에서만 사용

ALTER TABLE recipe_steps DROP COLUMN IF EXISTS step_type;
ALTER TABLE recipe_steps DROP COLUMN IF EXISTS duration_seconds;
ALTER TABLE recipe_steps DROP COLUMN IF EXISTS can_parallel;
