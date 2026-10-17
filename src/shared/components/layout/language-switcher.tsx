'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { LOCALE_NAMES, LOCALE_SHORT_NAMES, LOCALES, type Locale } from '@/shared/const/i18n.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { writeLocaleCookie } from '@/shared/utils/locale-cookie';

export const LanguageSwitcher = () => {
  const router = useRouter();
  const { t, locale } = useT();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === locale) return;
    writeLocaleCookie(next);
    startTransition(() => router.refresh());
  };

  return (
    <div role="group" aria-label={t.common.language} className={cn('flex rounded-md border border-border p-0.5', pending && 'opacity-60')}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={option === locale}
          aria-label={LOCALE_NAMES[option]}
          title={LOCALE_NAMES[option]}
          onClick={() => choose(option)}
          className={cn(
            'rounded-sm px-2 py-0.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            option === locale ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {LOCALE_SHORT_NAMES[option]}
        </button>
      ))}
    </div>
  );
};
