const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

function getChosung(str: string): string {
  return str
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00;
      if (code < 0 || code > 11171) return ch;
      return CHOSUNG[Math.floor(code / 588)];
    })
    .join('');
}

function isChosung(str: string): boolean {
  return str.split('').every((ch) => CHOSUNG.includes(ch));
}

import type { Ingredient } from '../types/ingredient';

export function searchIngredients(
  query: string,
  ingredients: Ingredient[],
): Ingredient[] {
  if (!query.trim()) return ingredients;

  const q = query.trim().toLowerCase();

  return ingredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(q) ||
      (isChosung(q) && getChosung(ing.name).includes(q)) ||
      ing.synonyms?.some((s) => s.toLowerCase().includes(q)),
  );
}
