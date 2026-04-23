import { z } from 'zod';

const stepSchema = z.object({
  description: z.string().min(1, '설명을 입력하세요'),
  stepType: z.enum(['active', 'wait']),
  durationSeconds: z.number().min(0).optional(),
  canParallel: z.boolean(),
  imageUrl: z.string().optional(),
});

const ingredientItemSchema = z.object({
  ingredientId: z.number({ error: '재료를 선택하세요' }),
  amount: z.number().optional(),
  unit: z.string().optional(),
  isRequired: z.boolean(),
});

export const recipeSchema = z.object({
  title: z.string().min(1, '요리명을 입력하세요'),
  category: z.string().min(1, '카테고리를 선택하세요'),
  difficulty: z.string().min(1, '난이도를 선택하세요'),
  cookingTimeMinutes: z.number({ error: '조리시간을 입력하세요' }).min(1, '1분 이상 입력하세요'),
  servings: z.number().optional(),
  calories: z.number().min(0, '0 이상 입력하세요').optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  tips: z.string().optional(),
  steps: z.array(stepSchema),
  ingredients: z.array(ingredientItemSchema),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type StepFormValues = z.infer<typeof stepSchema>;
export type IngredientItemFormValues = z.infer<typeof ingredientItemSchema>;
