import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, '재료명을 입력하세요'),
  categoryId: z.number({ error: '카테고리를 선택하세요' }),
  iconUrl: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
});

export type IngredientFormValues = z.infer<typeof ingredientSchema>;
