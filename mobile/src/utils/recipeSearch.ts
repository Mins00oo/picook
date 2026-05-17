import type { RecipeSummary } from '../types/recipe';

type RecipeLike = Pick<RecipeSummary, 'title'>;

export function filterRecipesByTitle<T extends RecipeLike>(recipes: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return recipes;

  return recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalized),
  );
}
