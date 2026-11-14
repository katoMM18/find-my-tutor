'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type RecruitFlyerProps = {
  subject: string;
};

// A thin wall recruits its own tutors: "Teach Physics? Pin your flyer here."
export const RecruitFlyer = ({ subject }: RecruitFlyerProps) => {
  const { data: session, status } = useSession();
  const { t, fmt, subject: subjectName } = useT();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role;

  if (status === 'loading' || role === 'teacher') return null;

  return (
    <aside className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-xl font-extrabold tracking-tight">
          {subject ? fmt(t.discovery.recruitSubjectTitle, { subject: subjectName(subject) }) : t.discovery.recruitTitle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{t.discovery.recruitText}</p>
      </div>
      <Link
        href={role === 'student' ? '/profile#switch-role' : '/sign-up?role=teacher'}
        className={cn(
          'shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-primary underline-offset-4 outline-none',
          'hover:underline focus-visible:ring-2 focus-visible:ring-ring/60'
        )}
      >
        {t.discovery.recruitAction}
      </Link>
    </aside>
  );
};
