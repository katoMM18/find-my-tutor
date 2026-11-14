'use client';

import { useEffect, useState } from 'react';

import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { VIP_PLAN_BY_STATUS, VIP_PLANS } from '@/shared/const/vip-plans.const';
import { type VipStatus } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

type PaidVipStatus = Exclude<VipStatus, 'none'>;

type VipStatusResponse = {
  status: VipStatus;
  expiresAt: string | null;
  rank: number;
  cancelAtPeriodEnd: boolean;
};

type PendingAction = { kind: 'cancel' } | { kind: 'switch'; status: PaidVipStatus } | null;

type VipSubscriptionManagerProps = {
  role: 'teacher' | 'student';
  checkoutSucceeded: boolean;
};

export const VipSubscriptionManager = ({ role, checkoutSucceeded }: VipSubscriptionManagerProps) => {
  const { t, fmt, date } = useT();
  const [current, setCurrent] = useState<VipStatusResponse | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoadFailed(false);
    void http.get<VipStatusResponse>('/vip/me').then(setCurrent).catch(() => setLoadFailed(true));
  };

  useEffect(load, []);

  // Payment-provider codes from the API get their own honest message; anything else keeps the action's own copy.
  const describeError = (caught: unknown, fallback: string) =>
    caught instanceof Error && caught.message.startsWith('PAYMENTS_') ? t.vip.providerError : fallback;

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setPending(null);
    } catch (caught) {
      setError(describeError(caught, failure));
    } finally {
      setBusy(false);
    }
  };

  const startCheckout = async (status: PaidVipStatus) => {
    setRedirecting(true);
    setError('');
    try {
      const result = await http.post<{ checkoutUrl: string }>('/vip/checkout', { status });
      window.location.assign(result.checkoutUrl);
    } catch (caught) {
      setError(describeError(caught, t.vip.checkoutError));
      setRedirecting(false);
    }
  };

  const changePlan = (status: PaidVipStatus) =>
    run(async () => setCurrent(await http.patch<VipStatusResponse>('/vip/manage', { status })), t.vip.changeError);

  const cancel = () =>
    run(async () => setCurrent(await http.delete<VipStatusResponse>('/vip/manage')), t.vip.cancelError);

  const rankCopy = role === 'teacher' ? t.vip.rankTeacher : t.vip.rankStudent;
  const activePlan = current && current.status !== 'none' ? VIP_PLAN_BY_STATUS[current.status] : null;
  const expiry = current?.expiresAt ? date(current.expiresAt) : null;

  return (
    <div className="space-y-8">
      <PageHeading title={t.vip.title} description={role === 'teacher' ? t.vip.leadTeacher : t.vip.leadStudent} />

      {checkoutSucceeded && (
        <Alert role="status">
          <AlertDescription className="text-foreground">{t.vip.checkoutSuccess}</AlertDescription>
        </Alert>
      )}

      {loadFailed ? (
        <Alert variant="destructive" className="sm:flex-row sm:items-center sm:justify-between">
          <AlertDescription className="text-destructive">{t.vip.loadError}</AlertDescription>
          <Button variant="outline" size="sm" onClick={load}>{t.common.tryAgain}</Button>
        </Alert>
      ) : !current ? (
        <div aria-busy="true" aria-label={t.common.loading} className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <section aria-labelledby="vip-current" className="rounded-lg paper py-5 pl-8 pr-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="vip-current" className="text-2xl font-bold">
                  <span className="font-normal text-muted-foreground">{t.vip.currentLabel}: </span>
                  {activePlan?.name ?? t.vip.noPlan}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {!activePlan
                    ? t.vip.noPlanNote
                    : current.cancelAtPeriodEnd
                      ? fmt(t.vip.endsOn, { date: expiry ?? '—' })
                      : expiry && fmt(t.vip.renewsOn, { date: expiry })}
                </p>
              </div>
              {activePlan && !current.cancelAtPeriodEnd && pending?.kind !== 'cancel' && (
                <Button variant="ghost" size="sm" className="self-start text-muted-foreground" onClick={() => setPending({ kind: 'cancel' })}>
                  {t.vip.cancel}
                </Button>
              )}
            </div>

            {activePlan && pending?.kind === 'cancel' && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="font-medium">{fmt(t.vip.cancelTitle, { name: activePlan.name })}</p>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                  {expiry ? fmt(t.vip.cancelBody, { date: expiry }) : t.vip.cancelBodyNoDate}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => setPending(null)}>{t.vip.keep}</Button>
                  <Button variant="destructive" size="sm" disabled={busy} onClick={cancel}>{t.vip.cancelConfirm}</Button>
                </div>
              </div>
            )}
          </section>

          {error && (
            <Alert variant="destructive">{error}</Alert>
          )}

          <ol className="divide-y divide-rule rounded-lg paper pl-2">
            {VIP_PLANS.map((plan) => {
              const isCurrent = current.status === plan.status;
              const confirming = pending?.kind === 'switch' && pending.status === plan.status;
              return (
                <li key={plan.status} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-lg font-semibold">{plan.name}</h2>
                        {isCurrent && <Badge variant="outline" className="border-ink text-ink">{t.vip.current}</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{rankCopy[plan.status]}</p>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <p className="shrink-0 whitespace-nowrap font-heading text-2xl font-extrabold tabular-nums">
                        ${plan.price}
                        <span className="ml-1 font-sans text-sm text-muted-foreground">{t.vip.perMonth}</span>
                      </p>
                      {!isCurrent && !confirming && (
                        <Button
                          variant={activePlan ? 'outline' : 'default'}
                          size="sm"
                          disabled={busy || redirecting}
                          onClick={() => (activePlan ? setPending({ kind: 'switch', status: plan.status }) : startCheckout(plan.status))}
                        >
                          {fmt(activePlan ? t.vip.switchTo : t.vip.choose, { name: plan.name })}
                        </Button>
                      )}
                      {isCurrent && current.cancelAtPeriodEnd && (
                        <Button size="sm" disabled={busy} onClick={() => changePlan(plan.status)}>{t.vip.keep}</Button>
                      )}
                    </div>
                  </div>

                  {confirming && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="font-medium">{fmt(t.vip.switchTitle, { name: plan.name, price: plan.price })}</p>
                      <p className="mt-1 max-w-prose text-sm text-muted-foreground">{t.vip.switchBody}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => setPending(null)}>{t.vip.back}</Button>
                        <Button size="sm" disabled={busy} onClick={() => changePlan(plan.status)}>{t.vip.switchConfirm}</Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {redirecting && <p role="status" className="text-sm text-muted-foreground">{t.vip.redirecting}</p>}

          <section aria-labelledby="vip-every-plan">
            <h2 id="vip-every-plan" className="font-heading text-lg font-semibold">{t.vip.everyPlan}</h2>
            <ul className="paper mt-3 divide-y divide-rule rounded-xl px-6">
              {[
                t.vip.perkBadge,
                role === 'teacher' ? t.vip.perkSortTeacher : t.vip.perkSortStudent,
                t.vip.perkRating,
                t.vip.perkCancel,
              ].map((perk) => (
                <li key={perk} className="py-3">{perk}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};
