'use client';

import { useEffect, useState } from 'react';

import { VIP_PLANS } from '@/shared/const/vip-plans.const';
import { type VipStatus } from '@/shared/const/vip.const';
import { http } from '@/shared/lib/http';

type VipStatusResponse = {
  status: VipStatus;
  expiresAt: string | null;
  rank: number;
};

export const VipSubscriptionManager = () => {
  const [current, setCurrent] = useState<VipStatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    void http.get<VipStatusResponse>('/vip/me').then(setCurrent).catch(() => setError('Unable to load subscription.'));
  };

  useEffect(load, []);

  const startCheckout = async (status: Exclude<VipStatus, 'none'>) => {
    setBusy(true);
    setError('');
    try {
      const result = await http.post<{ checkoutUrl: string }>('/vip/checkout', { status });
      window.location.assign(result.checkoutUrl);
    } catch {
      setError('Unable to start checkout.');
      setBusy(false);
    }
  };

  const changePlan = async (status: Exclude<VipStatus, 'none'>) => {
    setBusy(true);
    setError('');
    try {
      setCurrent(await http.patch<VipStatusResponse>('/vip/manage', { status }));
    } catch {
      setError('Unable to change plan.');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      setCurrent(await http.delete<VipStatusResponse>('/vip/manage'));
    } catch {
      setError('Unable to cancel subscription.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {VIP_PLANS.map((plan) => {
          const active = current?.status === plan.status;
          return (
            <section key={plan.status} className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <button
                type="button"
                disabled={busy}
                onClick={() => active ? cancel() : current?.status === 'none' ? startCheckout(plan.status) : changePlan(plan.status)}
                className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {active ? 'Cancel at period end' : current?.status === 'none' ? 'Choose plan' : 'Change plan'}
              </button>
            </section>
          );
        })}
      </div>
      {current?.expiresAt && (
        <p className="text-sm text-muted-foreground">
          {current.status === 'none' ? 'Subscription ended.' : `Access until ${new Date(current.expiresAt).toLocaleDateString()}.`}
        </p>
      )}
    </div>
  );
};
