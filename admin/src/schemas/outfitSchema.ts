import { z } from 'zod';

export const SLOT_OPTIONS = [
  { value: 'head', label: '머리 (head)' },
  { value: 'top', label: '상의 (top)' },
  { value: 'bottom', label: '하의 (bottom)' },
  { value: 'shoes', label: '신발 (shoes)' },
  { value: 'leftHand', label: '왼손 (leftHand)' },
  { value: 'rightHand', label: '오른손 (rightHand)' },
] as const;

export const outfitSchema = z.object({
  slot: z.enum(['head', 'top', 'bottom', 'shoes', 'leftHand', 'rightHand']),
  name: z.string().min(1, '이름을 입력하세요').max(60),
  description: z.string().max(200).optional(),
  imageUrl: z.string().min(1, '이미지 URL을 입력하세요'),
  pricePoints: z.number({ error: '가격을 입력하세요' }).min(0),
  unlockLevel: z.number().min(1).max(7).optional().nullable(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
});

export type OutfitFormValues = z.infer<typeof outfitSchema>;
