'use client';

import { Scale } from 'lucide-react';

import { usePriceGuide } from '@/features/discovery/hooks/use-price-guide';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type PriceGuideProps = {
  teacher: Pick<PublicTeacher, 'subjects' | 'areas' | 'pricePerLesson'>;
  className?: string;
};

// Within this many lari of the median, a price reads as "typical".
const TYPICAL_RANGE_GEL = 2;

// "Typical Maths lesson in Vake: 35 ₾ · this tutor is 5 ₾ below" — so parents know whether a price is fair.
export const PriceGuideNote = ({ teacher, className }: PriceGuideProps) => {
  const { t, fmt, subject, plural } = useT();
  const mainSubject = teacher.subjects[0];
  const guide = usePriceGuide(mainSubject, teacher.areas[0]);

  if (!guide || guide.median === null || teacher.pricePerLesson === null || !mainSubject) return null;

  const difference = teacher.pricePerLesson - guide.median;
  const comparison =
    Math.abs(difference) <= TYPICAL_RANGE_GEL
      ? t.priceGuide.typical
      : fmt(difference < 0 ? t.priceGuide.below : t.priceGuide.above, { amount: Math.abs(difference) });
  const typical = fmt(guide.scope === 'area' && teacher.areas[0] ? t.priceGuide.medianIn : t.priceGuide.median, {
    subject: subject(mainSubject),
    area: teacher.areas[0] ? t.lessons.areas[teacher.areas[0]] : '',
    price: guide.median,
  });

  return (
    <p className={cn('flex items-start gap-2 text-sm text-muted-foreground', className)}>
      <Scale className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {typical} <span className="text-foreground">· {comparison}</span>
        <span className="block text-xs">{plural(t.priceGuide.basedOn, guide.count)}</span>
      </span>
    </p>
  );
};
