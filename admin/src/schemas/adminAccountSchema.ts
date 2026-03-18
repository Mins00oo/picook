import { z } from 'zod';

export const adminAccountSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력하세요')
    .email('올바른 이메일 형식을 입력하세요'),
  password: z
    .string()
    .min(6, '6자 이상 입력하세요'),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'] as const, { error: '역할을 선택하세요' }),
});

export type AdminAccountFormValues = z.infer<typeof adminAccountSchema>;
