export type FeedbackStatus = 'unread' | 'read' | 'resolved';

export type FeedbackRating = 'easy' | 'adequate' | 'difficult';

export interface FeedbackItem {
  id: number;
  recipeId: number;
  recipeName: string;
  userId: string;
  userName: string;
  rating: FeedbackRating;
  comment?: string;
  status: FeedbackStatus;
  adminMemo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackDetailResponse extends FeedbackItem {
  recipeTitle: string;
  recipeCategory: string;
  userEmail?: string;
}

export interface UpdateFeedbackRequest {
  status: FeedbackStatus;
  adminMemo?: string;
}
