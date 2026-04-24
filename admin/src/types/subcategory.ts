export interface AdminSubcategory {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  emoji?: string | null;
  sortOrder: number;
}

export interface AdminSubcategoryRequest {
  categoryId: number;
  name: string;
  emoji?: string;
  sortOrder?: number;
}

export interface ReorderSubcategoryRequest {
  categoryId: number;
  orderedIds: number[];
}
