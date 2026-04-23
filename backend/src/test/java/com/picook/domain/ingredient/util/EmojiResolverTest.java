package com.picook.domain.ingredient.util;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmojiResolverTest {

    @Test
    void 재료에_이모지_있으면_재료_이모지_반환() {
        IngredientCategory cat = cat("채소", "🥬");
        IngredientSubcategory sub = sub(cat, "뿌리채소", "🥕");
        Ingredient ing = ingredient("마늘", cat, sub, "🧄");

        assertThat(EmojiResolver.resolve(ing)).isEqualTo("🧄");
    }

    @Test
    void 재료_이모지_없으면_서브카테고리_이모지() {
        IngredientCategory cat = cat("채소", "🥬");
        IngredientSubcategory sub = sub(cat, "뿌리채소", "🥕");
        Ingredient ing = ingredient("비트", cat, sub, null);

        assertThat(EmojiResolver.resolve(ing)).isEqualTo("🥕");
    }

    @Test
    void 재료_서브_둘다_없으면_대카테고리_이모지() {
        IngredientCategory cat = cat("채소", "🥬");
        IngredientSubcategory sub = sub(cat, "뿌리채소", null);
        Ingredient ing = ingredient("비트", cat, sub, null);

        assertThat(EmojiResolver.resolve(ing)).isEqualTo("🥬");
    }

    @Test
    void 모두_없으면_null() {
        IngredientCategory cat = cat("채소", null);
        Ingredient ing = ingredient("비트", cat, null, null);

        assertThat(EmojiResolver.resolve(ing)).isNull();
    }

    @Test
    void 서브가_null이면_대카테고리_fallback() {
        IngredientCategory cat = cat("채소", "🥬");
        Ingredient ing = ingredient("미분류", cat, null, null);

        assertThat(EmojiResolver.resolve(ing)).isEqualTo("🥬");
    }

    // --- 헬퍼 ---
    private static IngredientCategory cat(String name, String emoji) {
        IngredientCategory c = new IngredientCategory(name, 0);
        c.setEmoji(emoji);
        return c;
    }

    private static IngredientSubcategory sub(IngredientCategory cat, String name, String emoji) {
        return new IngredientSubcategory(cat, name, emoji, 0);
    }

    private static Ingredient ingredient(String name, IngredientCategory cat, IngredientSubcategory sub, String emoji) {
        Ingredient i = new Ingredient(name, cat);
        i.setSubcategory(sub);
        i.setEmoji(emoji);
        return i;
    }
}
