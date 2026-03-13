import type { AdminRole } from '@/types/admin';

type Menu =
  | 'dashboard'
  | 'recipes'
  | 'ingredients'
  | 'categories'
  | 'shorts'
  | 'shortsClearAll'
  | 'users'
  | 'feedback'
  | 'stats'
  | 'accounts';

const ACCESS_MATRIX: Record<Menu, AdminRole[]> = {
  dashboard: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  recipes: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  ingredients: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  categories: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  shorts: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  shortsClearAll: ['SUPER_ADMIN'],
  users: ['SUPER_ADMIN'],
  feedback: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  stats: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'VIEWER'],
  accounts: ['SUPER_ADMIN'],
};

export function canAccess(role: AdminRole | undefined, menu: Menu): boolean {
  if (!role) return false;
  return ACCESS_MATRIX[menu].includes(role);
}

export type { Menu };
