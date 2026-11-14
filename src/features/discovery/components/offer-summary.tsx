'use client';

import { BadgeCheck, CalendarClock, Gift, HandCoins, MessageSquareQuote } from 'lucide-react';

import { useNextFreeLabel } from '@/features/discovery/hooks/use-next-free-label';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useT } from '@/shared/hooks/use-t';

type OfferSummaryProps = {
  teacher: PublicTeacher;
};

// The top of the profile's side column: what a lesson costs, when the next one could be, and what we promise.
export const OfferSummary = ({ teacher }: OfferSummaryProps) => {
  const { t } = useT();
  const nextFree = useNextFreeLabel()(teacher.nextFree);
  const promises = [
    { icon: HandCoins, text: t.profile.promiseNoFees },
    { icon: MessageSquareQuote, text: t.profile.promiseReviews },
    ...(teacher.verified ? [{ icon: BadgeCheck, text: t.profile.promiseDiploma }] : []),
  ];

  return (
    <div className="paper rounded-lg p-5">
      {teacher.pricePerLesson !== null ? (
        <p className="font-heading text-4xl font-extrabold tabular-nums tracking-tight">
          {teacher.pricePerLesson} ₾ <span className="font-sans text-sm font-medium text-muted-foreground">{t.profile.perLesson}</span>
        </p>
      ) : (
        <p className="font-semibold">{t.profile.priceOnRequest}</p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {nextFree && teacher.acceptingStudents && (
          <li className="flex items-center gap-2 font-medium text-primary">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" /> {nextFree}
          </li>
        )}
        {teacher.freeIntro && (
          <li className="flex items-center gap-2 font-medium">
            <Gift className="size-4 shrink-0 text-primary" aria-hidden="true" /> {t.lessons.freeIntroLong}
          </li>
        )}
        {!teacher.acceptingStudents && <li className="font-medium text-destructive">{t.lessons.notAccepting}</li>}
      </ul>
      <ul className="mt-4 space-y-2 border-t border-dashed border-rule pt-4 text-sm text-muted-foreground">
        {promises.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};
