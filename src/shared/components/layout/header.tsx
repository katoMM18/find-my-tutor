'use client';
import { GraduationCap, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { LanguageSwitcher } from '@/shared/components/layout/language-switcher';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { APP_NAME } from '@/shared/const/app.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: 'teacher' | 'student';
};

const navLinkClassName = 'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground';

export const Header = () => {
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const pathname = usePathname();
  const { t } = useT();
  const sessionUser = session?.user as SessionUser | undefined;
  const userName = sessionUser?.name ?? '';
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-4 border-b border-border
        bg-background/90 px-4 py-3 backdrop-blur sm:px-8"
    >
      <Link
        href={sessionUser ? '/dashboard' : '/'}
        className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-4" />
        </span>
        <span className="font-heading text-base font-semibold tracking-tight text-foreground">{APP_NAME}</span>
      </Link>

      <nav aria-label={t.nav.main} className="hidden items-center gap-1 text-muted-foreground md:flex">
        {sessionUser?.role !== 'teacher' && (
          <Link href="/teachers" className={cn(navLinkClassName, isActive('/teachers') && 'text-foreground')}>
            {t.nav.findTutors}
          </Link>
        )}
        {sessionUser && (
          <Link href="/messages" className={cn(navLinkClassName, isActive('/messages') && 'text-foreground')}>
            {t.nav.messages}
          </Link>
        )}
        {!sessionUser && status !== 'loading' && (
          <Link href="/sign-up?role=teacher" className={navLinkClassName}>
            {t.nav.becomeTutor}
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeToggle />
        {sessionUser ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full p-1 outline-none hover:bg-accent
                focus-visible:ring-2 focus-visible:ring-ring/50 sm:pr-3"
            >
              <UserAvatar name={userName} src={sessionUser.avatar} size="sm" />
              <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{userName}</span>
            </Link>
            <Button variant="ghost" size="icon-sm" onClick={logout} aria-label={t.common.signOut} className="text-muted-foreground">
              <LogOut className="size-4" />
            </Button>
          </>
        ) : status !== 'loading' && (
          <>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/sign-in">{t.common.signIn}</Link>
            </Button>
            <Button size="sm" asChild className="font-semibold">
              <Link href="/sign-up">{t.common.signUp}</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
