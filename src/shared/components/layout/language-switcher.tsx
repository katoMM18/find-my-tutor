'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
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
    <ToggleGroup
      type="single"
      size="sm"
      aria-label={t.common.language}
      value={locale}
      onValueChange={(next) => {
        const match = LOCALES.find((option) => option === next);
        if (match) choose(match);
      }}
      className={cn('gap-0.5 rounded-lg border border-border bg-card p-0.5', pending && 'opacity-60')}
    >
      {LOCALES.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          lang={option}
          aria-label={LOCALE_NAMES[option]}
          title={LOCALE_NAMES[option]}
          className="h-6 min-w-0 rounded-md px-2.5 text-xs font-semibold text-muted-foreground"
        >
          {LOCALE_SHORT_NAMES[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
