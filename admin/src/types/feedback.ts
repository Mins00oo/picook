export type FeedbackStatus = 'unread' | 'read' | 'resolved';

export type FeedbackRating = 'easy' | 'adequate' | 'difficult';

export interface FeedbackItem {
  id: number;
  userId: string;
  userDisplayName: string;
  recipeId: number;
  recipeTitle: string;
  rating: FeedbackRating;
  adminStatus: FeedbackStatus;
  createdAt: string;
}

export interface FeedbackDetailResponse {
  id: number;
  userId: string;
  userDisplayName: string;
  userEmail?: string;
  recipeId: number;
  recipeTitle: string;
  rating: FeedbackRating;
  comment?: string;
  adminStatus: FeedbackStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFeedbackStatusRequest {
  status: string;
}

export interface UpdateFeedbackNoteRequest {
  note: string;
}
