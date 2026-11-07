'use client';

import { PublicRequest } from '@/features/requests/types/request.types';
import { useT } from '@/shared/hooks/use-t';

// One line of facts for a request: goal, where, budget.
export const RequestSummary = ({ request }: { request: PublicRequest }) => {
  const { t, fmt, relative } = useT();
  const facts = [
    t.requests.goals[request.goal],
    request.format && t.lessons.formats[request.format],
    request.area && t.lessons.areas[request.area],
    request.budget !== null && fmt(t.lessons.upTo, { price: request.budget }),
  ].filter(Boolean);

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{facts.join(' · ')}</p>
      {request.note && <p className="text-sm leading-relaxed">{request.note}</p>}
      <p className="text-xs text-muted-foreground">{fmt(t.requests.postedAgo, { time: relative(request.createdAt) })}</p>
    </div>
  );
};
