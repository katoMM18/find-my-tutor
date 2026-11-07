'use client';
import { LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { BrandMark } from '@/shared/components/layout/brand-mark';
import { LanguageSwitcher } from '@/shared/components/layout/language-switcher';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: 'teacher' | 'student';
};

type HeaderProps = {
  // Provided by the signed-in shell: opens the workspace drawer on small screens.
  onOpenMenu?: () => void;
  menuOpen?: boolean;
};

const navLinkClassName = cn(
  'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none',
  'hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60'
);

export const Header = ({ onOpenMenu, menuOpen = false }: HeaderProps) => {
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const pathname = usePathname();
  const { t } = useT();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const sessionUser = session?.user as SessionUser | undefined;
  const userName = sessionUser?.name ?? '';
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const links = [
    sessionUser?.role !== 'teacher' && { href: '/teachers', label: t.nav.findTutors },
    sessionUser && { href: '/messages', label: t.nav.messages },
    sessionUser && { href: '/dashboard', label: t.nav.home },
    !sessionUser && status !== 'loading' && { href: '/sign-up?role=teacher', label: t.nav.becomeTutor },
    sessionUser?.role === 'student' && { href: '/profile#switch-role', label: t.nav.becomeTutor },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <header className="sticky top-0 z-40 shrink-0 px-3 pt-3 sm:px-6">
      <div className="paper flex items-center justify-between gap-3 rounded-lg py-2 pl-4 pr-2 sm:pl-5">
        <div className="flex items-center gap-2">
          {onOpenMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMenu}
              aria-label={t.common.openNavigation}
              aria-expanded={menuOpen}
              className="-ml-2 lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
          )}
          <Link
            href="/"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <BrandMark />
          </Link>
        </div>

        <nav aria-label={t.nav.main} className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href.split('?')[0]) ? 'page' : undefined}
              className={cn(navLinkClassName, isActive(link.href.split('?')[0]) && 'bg-accent text-foreground')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {sessionUser ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg p-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 sm:pr-3"
              >
                <UserAvatar name={userName} src={sessionUser.avatar} size="sm" />
                <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{userName}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} aria-label={t.common.signOut} className="text-muted-foreground">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : status !== 'loading' && (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden text-muted-foreground sm:inline-flex">
                <Link href="/sign-in">{t.common.signIn}</Link>
              </Button>
              <Button size="sm" asChild className="font-semibold">
                <Link href="/sign-up">{t.common.signUp}</Link>
              </Button>
            </>
          )}
          {!onOpenMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPublicMenuOpen(true)}
              aria-label={t.common.openNavigation}
              aria-expanded={publicMenuOpen}
              className="md:hidden"
            >
              <Menu className="size-5" />
            </Button>
          )}
        </div>
      </div>

      {!onOpenMenu && (
        <Sheet open={publicMenuOpen} onOpenChange={setPublicMenuOpen}>
          <SheetContent side="right" closeLabel={t.common.closeNavigation} className="md:hidden">
            <SheetHeader>
              <SheetTitle>{t.common.navigation}</SheetTitle>
            </SheetHeader>
            <nav aria-label={t.nav.main} className="flex flex-col px-3">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setPublicMenuOpen(false)} className={cn(navLinkClassName, 'py-3 text-base')}>
                  {link.label}
                </Link>
              ))}
              {!sessionUser && status !== 'loading' && (
                <Link href="/sign-in" onClick={() => setPublicMenuOpen(false)} className={cn(navLinkClassName, 'py-3 text-base')}>
                  {t.common.signIn}
                </Link>
              )}
            </nav>
            <div className="mt-auto flex items-center gap-2 border-t border-rule p-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
};
