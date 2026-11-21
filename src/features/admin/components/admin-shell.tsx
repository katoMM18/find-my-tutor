'use client';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { ADMIN_COLLECTIONS } from '@/shared/const/admin.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type AdminShellProps = {
  children: ReactNode;
};

const linkClassName = (active: boolean) =>
  cn(
    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring/60',
    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  );

// Section list beside every admin page: a scrolling row on phones, a column from lg up.
export const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
      <nav
        aria-label={t.admin.collectionsNav}
        className="paper -mx-1 flex gap-1 overflow-x-auto rounded-xl p-2 lg:sticky lg:top-4 lg:mx-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible"
      >
        <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} className={linkClassName(pathname === '/admin')}>
          <LayoutGrid className="size-4 shrink-0" aria-hidden="true" />
          {t.admin.overview}
        </Link>
        <p className="hidden px-3 pb-1 pt-3 text-xs font-semibold text-muted-foreground lg:block">{t.admin.collectionsHeading}</p>
        {ADMIN_COLLECTIONS.map(({ key }) => {
          const href = `/admin/${key}`;
          const active = pathname === href;
          return (
            <Link key={key} href={href} aria-current={active ? 'page' : undefined} className={linkClassName(active)}>
              {t.admin.collections[key] ?? key}
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};
