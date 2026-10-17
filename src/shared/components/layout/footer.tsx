'use client';

import Link from 'next/link';

import { APP_NAME } from '@/shared/const/app.const';
import { useT } from '@/shared/hooks/use-t';

export const Footer = () => {
  const { t } = useT();

  return (
    <footer className="border-t border-border px-6 py-8 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {APP_NAME}. {t.footer.note}</p>
        <nav aria-label={t.nav.footer} className="flex flex-wrap gap-5">
          <Link href="/teachers" className="hover:text-foreground">{t.nav.findTutors}</Link>
          <Link href="/sign-up?role=teacher" className="hover:text-foreground">{t.nav.becomeTutor}</Link>
          <Link href="/sign-in" className="hover:text-foreground">{t.common.signIn}</Link>
        </nav>
      </div>
    </footer>
  );
};
