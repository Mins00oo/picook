-- V27: 재료 role 재분류 결과 시드 준비 (step8_classify_roles 결과 반영)
--
-- 배경:
--   - V25 적용 + 백오피스 시드 업로드로 1차 시드가 들어가 있는 상태
--   - 1차 시드의 recipe_ingredients.is_required 가 망가진 분류 결과:
--     · 식약처 870건: 72.1% 가 필수 (휴리스틱 과대분류)
--     · LLM 138건: role 라벨 자체가 없어 전부 is_required=false 로 떨어짐
--   - step8_classify_roles.py + gpt-5.4-mini 로 1008건 재분류 완료
--     · 식약처: 필수 38.8% / 평균 3.7개/레시피
--     · LLM:    필수 31.3% / 평균 2.91개/레시피
--   - 백오피스 SeedImportService 는 INSERT 전용 (UPDATE/UPSERT 없음)
--     → 기존 시드 truncate 후 갱신된 picook_seed.xlsx 재업로드 필요
--
-- 이 마이그레이션이 하는 일:
--   - V25 와 동일하게 시드 데이터 모두 정리 (CASCADE)
--   - 스키마 변경 없음 (V25/V26 으로 이미 완료)
--
-- 주의 (V25 와 동일):
--   - 사용자 데이터(user_fridge_ingredients/favorites/cookbook_entries 등)도 cascade 삭제됨
--   - 출시 전 dev 환경 가정 — 운영 시작 후엔 실행 X
--   - 적용 후 백오피스 엑셀 업로드 화면에서 갱신된 picook_seed.xlsx 업로드 필요

-- =================================================================
-- 시드 데이터 정리 (V25 와 동일 CASCADE 패턴)
-- =================================================================
-- ingredients TRUNCATE CASCADE → ingredient_synonyms, recipe_ingredients,
--                                user_fridge_ingredients, unit_conversions
-- recipes TRUNCATE CASCADE → recipe_ingredients, recipe_steps, favorites,
--                            cookbook_entries (+cookbook_photos), search_history 등
-- 참고: V26 의 ingredients.parent_id 는 ingredients 테이블 자체가 비워지므로 자동 정리

TRUNCATE TABLE recipes                  RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredients              RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredient_subcategories RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredient_categories    RESTART IDENTITY CASCADE;
TRUNCATE TABLE unit_conversions         RESTART IDENTITY CASCADE;
