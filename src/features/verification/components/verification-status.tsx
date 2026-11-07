'use client';

import { BadgeCheck, Clock3, XCircle } from 'lucide-react';

import { MyVerification } from '@/features/verification/types/verification.types';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type VerificationStatusProps = {
  verification: MyVerification | null;
};

// Where the tutor's diploma check stands: not sent, waiting, approved, or rejected with the admin's reason.
export const VerificationStatus = ({ verification }: VerificationStatusProps) => {
  const { t, fmt } = useT();
  if (!verification) return null;

  const { status, reason } = verification;
  const Icon = status === 'approved' ? BadgeCheck : status === 'rejected' ? XCircle : Clock3;
  const text =
    status === 'approved'
      ? t.verification.statusApproved
      : status === 'pending'
        ? t.verification.statusPending
        : status === 'rejected'
          ? fmt(t.verification.statusRejected, { reason })
          : t.verification.statusNone;

  return (
    <p
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        status === 'approved' && 'border-primary/40 text-primary',
        status === 'rejected' && 'border-destructive/40 text-destructive',
        (status === 'pending' || status === 'none') && 'border-border text-muted-foreground'
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
};
