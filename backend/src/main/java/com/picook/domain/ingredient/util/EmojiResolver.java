package com.picook.domain.ingredient.util;

import com.picook.domain.ingredient.entity.Ingredient;
import com.picook.domain.ingredient.entity.IngredientCategory;
import com.picook.domain.ingredient.entity.IngredientSubcategory;

/**
 * 이모지 fallback: ingredient → subcategory → category.
 * icon_url이 설정되면 클라이언트가 그걸 우선 렌더; 이모지는 대체 시각 요소.
 */
public final class EmojiResolver {
    private EmojiResolver() {}

    public static String resolve(Ingredient ing) {
        if (ing == null) return null;
        if (isNotBlank(ing.getEmoji())) return ing.getEmoji();

        IngredientSubcategory sub = ing.getSubcategory();
        if (sub != null && isNotBlank(sub.getEmoji())) return sub.getEmoji();

        IngredientCategory cat = ing.getCategory();
        if (cat != null && isNotBlank(cat.getEmoji())) return cat.getEmoji();

        return null;
    }

    private static boolean isNotBlank(String s) {
        return s != null && !s.isBlank();
    }
}
