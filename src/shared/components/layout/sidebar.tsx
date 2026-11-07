'use client';
import {
  CalendarClock,
  House,
  MessagesSquare,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
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
  billing: Sparkles,
  requests: Megaphone,
  admin: ShieldCheck,
};

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { t } = useT();
  const { data: session } = useSession();
  const sessionUser = session?.user as { role?: 'teacher' | 'student'; isAdmin?: boolean } | undefined;
  const items = [...(sessionUser?.role === 'teacher' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS), ...(sessionUser?.isAdmin ? ADMIN_NAV_ITEMS : [])];

  return (
    <aside className={cn('paper m-3 mr-0 flex w-60 shrink-0 flex-col gap-1 self-start rounded-xl p-3', className)}>
      <nav aria-label={t.nav.workspace} className="flex flex-col gap-0.5">
        {items.map(({ href, labelKey, icon }) => {
          const Icon = SIDEBAR_ICON_MAP[icon];
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

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
    </aside>
  );
};
