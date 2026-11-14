'use client';

import { MatchWizard } from '@/features/discovery/components/match-wizard';
import { useT } from '@/shared/hooks/use-t';

export const MatchPage = () => {
  const { t } = useT();

  return (
    <main className="flex-1 px-4 pb-20 pt-10 sm:px-8 sm:pt-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-8 max-w-2xl">
          <h1 className="font-heading text-5xl font-extrabold leading-none sm:text-6xl">{t.match.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.match.lead}</p>
        </div>
        <MatchWizard />
      </div>
    </main>
  );
};
