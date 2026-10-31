'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { BrandMark } from '@/shared/components/layout/brand-mark';
import { useT } from '@/shared/hooks/use-t';

export const Footer = () => {
  const { t } = useT();
  const { data: session, status } = useSession();

  return (
    <footer className="mt-16 border-t-4 border-foreground/10 bg-wall px-4 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <BrandMark />
          <p className="mt-3 text-sm text-white/80">{t.footer.note}</p>
        </div>
        <nav aria-label={t.nav.footer} className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/teachers" className="text-white/80 hover:text-white hover:underline">{t.nav.findTutors}</Link>
          <Link href="/sign-up?role=teacher" className="text-white/80 hover:text-white hover:underline">{t.nav.becomeTutor}</Link>
          {session ? (
            <Link href="/dashboard" className="text-white/80 hover:text-white hover:underline">{t.nav.home}</Link>
          ) : status !== 'loading' && (
            <Link href="/sign-in" className="text-white/80 hover:text-white hover:underline">{t.common.signIn}</Link>
          )}
        </nav>
      </div>
    </footer>
  );
};
