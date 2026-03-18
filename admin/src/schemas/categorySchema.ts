import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
