'use client';

import { ShortlistCompare } from '@/features/shortlist/components/shortlist-compare';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { useT } from '@/shared/hooks/use-t';

export const ShortlistPage = () => {
  const { t } = useT();

  return (
    <main className="flex-1 px-4 pb-20 pt-10 sm:px-8 sm:pt-14">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeading title={t.shortlist.title} description={t.shortlist.lead} />
        <ShortlistCompare />
      </div>
    </main>
  );
};
