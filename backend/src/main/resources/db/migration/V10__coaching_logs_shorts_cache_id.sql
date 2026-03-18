-- 쇼츠 변환 레시피로 코칭을 시작할 수 있도록 shorts_cache_id 컬럼 추가
-- recipe_ids OR shorts_cache_id 둘 중 하나를 사용

ALTER TABLE coaching_logs ADD COLUMN shorts_cache_id INTEGER REFERENCES shorts_cache(id);

-- cooking_completions의 recipe_id도 nullable로 변경 (쇼츠 코칭 시 recipe_id 없음)
ALTER TABLE cooking_completions ALTER COLUMN recipe_id DROP NOT NULL;
