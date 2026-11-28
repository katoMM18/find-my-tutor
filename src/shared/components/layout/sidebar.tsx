'use client';
import {
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  Crown,
  House,
  MessagesSquare,
  Megaphone,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  ADMIN_NAV_ITEMS,
  STUDENT_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
  type SidebarNavIcon,
} from '@/shared/const/navigation.const';
import { type AccountRole } from '@/shared/const/roles.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

const SIDEBAR_ICON_MAP: Record<SidebarNavIcon, LucideIcon> = {
  home: House,
  search: Search,
  messages: MessagesSquare,
  students: UsersRound,
  reviews: Star,
  availability: CalendarClock,
  profile: UserRound,
  billing: Crown,
  requests: Megaphone,
  admin: ShieldCheck,
  verify: BadgeCheck,
};

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { t } = useT();
  const { data: session } = useSession();
  const sessionUser = session?.user as { role?: AccountRole; isAdmin?: boolean } | undefined;
  const roleItems = sessionUser?.role === 'admin' ? [] : sessionUser?.role === 'teacher' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;
  const items = [...roleItems, ...(sessionUser?.isAdmin ? ADMIN_NAV_ITEMS : [])];
  const listItems = items.filter((item) => !item.featured);
  const featuredItems = items.filter((item) => item.featured);
  // The longest matching link wins, so /admin/verifications doesn't also light up /admin.
  const activeHref = items
    .map(({ href }) => href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <aside className={cn('paper m-3 mr-0 flex w-60 shrink-0 flex-col gap-1 self-start rounded-xl p-3', className)}>
      <nav aria-label={t.nav.workspace} className="flex flex-col gap-0.5">
        {listItems.map(({ href, labelKey, icon }) => {
          const Icon = SIDEBAR_ICON_MAP[icon];
          const isActive = href === activeHref;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring/60',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {t.nav[labelKey]}
            </Link>
          );
        })}
      </nav>

      {featuredItems.map(({ href, labelKey, icon }) => {
        const Icon = SIDEBAR_ICON_MAP[icon];
        const isActive = href === activeHref;

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group mt-2 flex items-center gap-3 rounded-lg border-2 border-mark/50 bg-mark/10 px-3 py-3 transition-colors outline-none',
              'hover:border-mark hover:bg-mark/15 focus-visible:ring-2 focus-visible:ring-ring/60',
              isActive && 'border-mark bg-mark/20'
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-mark text-background">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-bold text-foreground">{t.nav[labelKey]}</span>
              <span className="text-xs text-muted-foreground">{t.nav.billingHint}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-mark transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        );
      })}
    </aside>
  );
};
