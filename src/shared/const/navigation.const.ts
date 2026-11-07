import { type Dictionary } from '@/shared/types/i18n';

export type SidebarNavIcon = 'home' | 'search' | 'messages' | 'students' | 'reviews' | 'availability' | 'profile' | 'billing' | 'requests' | 'admin';

export type SidebarNavItem = {
  href: string;
  labelKey: keyof Dictionary['nav'];
  icon: SidebarNavIcon;
};

export const STUDENT_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', labelKey: 'home', icon: 'home' },
  { href: '/teachers', labelKey: 'findTutors', icon: 'search' },
  { href: '/requests', labelKey: 'requests', icon: 'requests' },
  { href: '/messages', labelKey: 'messages', icon: 'messages' },
  { href: '/reviews', labelKey: 'reviews', icon: 'reviews' },
  { href: '/profile', labelKey: 'profile', icon: 'profile' },
  { href: '/subscription', labelKey: 'billing', icon: 'billing' },
];

export const ADMIN_NAV_ITEMS: SidebarNavItem[] = [{ href: '/admin/verifications', labelKey: 'admin', icon: 'admin' }];

export const TEACHER_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', labelKey: 'home', icon: 'home' },
  { href: '/messages', labelKey: 'messages', icon: 'messages' },
  { href: '/requests', labelKey: 'requests', icon: 'requests' },
  { href: '/students', labelKey: 'students', icon: 'students' },
  { href: '/reviews', labelKey: 'reviews', icon: 'reviews' },
  { href: '/availability', labelKey: 'availability', icon: 'availability' },
  { href: '/profile', labelKey: 'profile', icon: 'profile' },
  { href: '/subscription', labelKey: 'billing', icon: 'billing' },
];
