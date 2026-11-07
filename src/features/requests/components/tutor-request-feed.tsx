'use client';

import { MessageCircle } from 'lucide-react';

import { RequestSummary } from '@/features/requests/components/request-summary';
import { useRequests } from '@/features/requests/hooks/use-requests';
import { TutorRequest } from '@/features/requests/types/request.types';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';

export const TutorRequestFeed = () => {
  const { t, subject: subjectName } = useT();
  const { items, busyId, error, reply } = useRequests<TutorRequest>();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title={t.requests.tutorTitle} description={t.requests.tutorLead} />
      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
      {items === null ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : items.length === 0 ? (
        <p className="paper rounded-xl p-6 text-muted-foreground">{t.requests.tutorEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((request) => (
            <li key={request.id} className="paper flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <UserAvatar name={request.studentName} src={request.studentAvatar} />
                <div className="min-w-0 space-y-1">
                  <p className="font-heading text-lg font-bold">
                    {subjectName(request.subject)} <span className="font-sans text-sm font-normal text-muted-foreground">· {request.studentName}</span>
                  </p>
                  <RequestSummary request={request} />
                </div>
              </div>
              <Button size="sm" disabled={request.replied || busyId === request.id} onClick={() => void reply(request.id)}>
                <MessageCircle className="size-4" aria-hidden="true" />
                {request.replied ? t.requests.replied : t.requests.reply}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
