'use client';

import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

const TILTS = ['tilt-l', '', 'tilt-r'];

// Three notes pinned in a row: find, message, try a lesson.
export const HowItWorks = () => {
  const { t } = useT();

  return (
    <section aria-labelledby="how-heading" className="px-4 pt-16 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <h2 id="how-heading" className="font-heading text-3xl font-extrabold sm:text-4xl">{t.home.howTitle}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{t.home.howLead}</p>
        <ol className="pin-drop mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {t.home.howSteps.map((step, index) => (
            <li key={step.title} className={cn('paper tape rounded-lg px-5 pb-5 pt-7', TILTS[index])}>
              <p aria-hidden="true" className="font-heading text-5xl font-extrabold leading-none text-primary">{index + 1}</p>
              <h3 className="mt-3 text-xl font-bold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/match"><Sparkles className="size-4" aria-hidden="true" /> {t.match.cta}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/teachers"><Search className="size-4" aria-hidden="true" /> {t.home.seeAllTutors}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
