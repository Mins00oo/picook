import { z } from 'zod';

export const feedbackSchema = z.object({
  status: z.string(),
  adminNote: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
