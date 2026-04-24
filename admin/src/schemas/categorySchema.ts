import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  emoji: z.string().max(8, '이모지는 8자 이하여야 합니다').optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
