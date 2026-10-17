'use client';

import { AvailabilityEditor } from '@/features/availability/components/availability-editor';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { useT } from '@/shared/hooks/use-t';

export const AvailabilitySettings = () => {
  const { t } = useT();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title={t.availability.title} description={t.availability.lead} />
      <AvailabilityEditor />
    </div>
  );
};
