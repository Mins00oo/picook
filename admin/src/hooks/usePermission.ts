import { useAuthStore } from '@/stores/authStore';
import { canAccess, type Menu } from '@/utils/permission';

export function usePermission() {
  const admin = useAuthStore((s) => s.admin);

  return {
    canWrite: admin?.role === 'SUPER_ADMIN' || admin?.role === 'CONTENT_ADMIN',
    isSuperAdmin: admin?.role === 'SUPER_ADMIN',
    canAccessMenu: (menu: Menu) => canAccess(admin?.role, menu),
  };
}
