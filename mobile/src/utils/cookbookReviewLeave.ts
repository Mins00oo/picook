interface CookbookReviewLeaveState {
  hasDraft: boolean;
  hasSavedEntry: boolean;
  isSubmitting: boolean;
  isDiscarding: boolean;
}

export function shouldPromptCookbookReviewLeave({
  hasDraft,
  hasSavedEntry,
  isSubmitting,
  isDiscarding,
}: CookbookReviewLeaveState): boolean {
  return hasDraft && !hasSavedEntry && !isSubmitting && !isDiscarding;
}
