import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, '재료명을 입력하세요'),
  categoryId: z.number({ error: '카테고리를 선택하세요' }),
  subcategoryId: z.number().nullable().optional(),
  emoji: z.string().max(8, '이모지는 8자 이하여야 합니다').optional(),
  iconUrl: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
});

export type IngredientFormValues = z.infer<typeof ingredientSchema>;
