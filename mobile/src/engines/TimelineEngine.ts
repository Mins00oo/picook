import type { RecipeStep } from '../types/recipe';

export interface TimelineItem {
  recipeIndex: number;
  recipeTitle: string;
  step: RecipeStep;
  startOffsetSeconds: number;
  isTransition?: boolean;
}

export class TimelineEngine {
  static generate(
    recipes: { title: string; steps: RecipeStep[] }[],
  ): TimelineItem[] {
    const timeline: TimelineItem[] = [];
    const cursors = recipes.map(() => 0);
    const offsets = recipes.map(() => 0);
    let totalOffset = 0;

    // Interleave: during WAIT steps of one recipe, insert ACTIVE steps of the other
    const maxIterations = recipes.reduce((sum, r) => sum + r.steps.length, 0);
    let iterations = 0;

    while (iterations < maxIterations) {
      for (let r = 0; r < recipes.length; r++) {
        const recipe = recipes[r];
        const stepIdx = cursors[r];
        if (stepIdx >= recipe.steps.length) continue;

        const step = recipe.steps[stepIdx];
        timeline.push({
          recipeIndex: r,
          recipeTitle: recipe.title,
          step,
          startOffsetSeconds: totalOffset,
        });

        const duration = step.durationSeconds ?? 60;
        totalOffset += duration;
        offsets[r] = totalOffset;
        cursors[r]++;
        iterations++;
      }
    }

    return timeline;
  }

  static getEstimatedTotalTime(timeline: TimelineItem[]): number {
    if (timeline.length === 0) return 0;
    const last = timeline[timeline.length - 1];
    return last.startOffsetSeconds + (last.step.durationSeconds ?? 60);
  }
}
