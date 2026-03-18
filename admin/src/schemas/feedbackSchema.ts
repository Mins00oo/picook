import { z } from 'zod';

export const feedbackSchema = z.object({
  status: z.string(),
  adminMemo: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
