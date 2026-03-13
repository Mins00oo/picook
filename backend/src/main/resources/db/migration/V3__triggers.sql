-- =============================================
-- Trigger: coaching_ready 자동 갱신
-- recipe_steps 변경 시 해당 레시피의 coaching_ready 재계산
-- 모든 step에 duration_seconds > 0 이면 TRUE
-- =============================================

CREATE OR REPLACE FUNCTION update_coaching_ready()
RETURNS TRIGGER AS $$
DECLARE
    target_recipe_id INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_recipe_id := OLD.recipe_id;
    ELSE
        target_recipe_id := NEW.recipe_id;
    END IF;

    UPDATE recipes
    SET coaching_ready = (
        SELECT COUNT(*) > 0
           AND COUNT(*) = COUNT(CASE WHEN duration_seconds > 0 THEN 1 END)
        FROM recipe_steps
        WHERE recipe_id = target_recipe_id
    ),
    updated_at = NOW()
    WHERE id = target_recipe_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipe_steps_coaching_ready
    AFTER INSERT OR UPDATE OR DELETE ON recipe_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_coaching_ready();

-- =============================================
-- Trigger: completed_cooking_count 자동 증가
-- cooking_completions INSERT 시 users.completed_cooking_count +1
-- =============================================

CREATE OR REPLACE FUNCTION increment_cooking_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET completed_cooking_count = completed_cooking_count + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cooking_completions_count
    AFTER INSERT ON cooking_completions
    FOR EACH ROW
    EXECUTE FUNCTION increment_cooking_count();
