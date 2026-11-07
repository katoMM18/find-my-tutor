'use client';

import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { useAdminVerifications } from '@/features/verification/hooks/use-admin-verifications';
import { PendingVerification } from '@/features/verification/types/verification.types';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';

type QueueItemProps = {
  item: PendingVerification;
  busy: boolean;
  onDecide: (decision: 'approve' | 'reject', reason?: string) => void;
};

const QueueItem = ({ item, busy, onDecide }: QueueItemProps) => {
  const { t, fmt, date } = useT();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const reasonId = `reason-${item.id}`;

  return (
    <li className="paper space-y-4 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold">{item.tutorName}</p>
          <p className="truncate text-sm text-muted-foreground">{item.tutorEmail}</p>
          <p className="text-xs text-muted-foreground">{fmt(t.verification.adminSubmitted, { date: date(item.submittedAt) })}</p>
        </div>
        {item.fileUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={item.fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              {t.verification.adminOpenFile}
            </a>
          </Button>
        )}
      </div>

      {rejecting ? (
        <div className="space-y-2">
          <Label htmlFor={reasonId}>{t.verification.adminReasonLabel}</Label>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder={t.verification.adminReasonPlaceholder}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setRejecting(false)}>{t.vip.back}</Button>
            <Button variant="destructive" size="sm" disabled={busy || !reason.trim()} onClick={() => onDecide('reject', reason.trim())}>
              {t.verification.adminReject}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => onDecide('approve')}>{t.verification.adminApprove}</Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => setRejecting(true)}>{t.verification.adminReject}</Button>
        </div>
      )}
    </li>
  );
};

export const AdminVerificationQueue = () => {
  const { t } = useT();
  const { items, busyId, error, decide } = useAdminVerifications();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title={t.verification.adminTitle} description={t.verification.adminLead} />
      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
      {items === null ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : items.length === 0 ? (
        <p className="paper rounded-xl p-6 text-muted-foreground">{t.verification.adminEmpty}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <QueueItem key={item.id} item={item} busy={busyId === item.id} onDecide={(decision, reason) => void decide(item.id, decision, reason)} />
          ))}
        </ul>
      )}
    </div>
  );
};
