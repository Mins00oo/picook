let timeRecipeSessionSeed: string | null = null;

export function getTimeRecipeSessionSeed(): string {
  if (timeRecipeSessionSeed == null) {
    timeRecipeSessionSeed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return timeRecipeSessionSeed;
}
