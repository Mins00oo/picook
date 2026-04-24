import { z } from 'zod';

export const subcategorySchema = z.object({
  categoryId: z.number({ error: '카테고리를 선택하세요' }),
  name: z.string().min(1, '이름을 입력하세요').max(50, '이름은 50자 이하여야 합니다'),
  emoji: z.string().max(8, '이모지는 8자 이하여야 합니다').optional(),
  sortOrder: z.number().min(0).optional(),
});

export type SubcategoryFormValues = z.infer<typeof subcategorySchema>;
