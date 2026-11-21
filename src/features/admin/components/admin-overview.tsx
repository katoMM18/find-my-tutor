'use client';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import Link from 'next/link';

import { useAdminOverview } from '@/features/admin/hooks/use-admin-overview';
import { type AdminStat } from '@/features/admin/types/admin.types';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ADMIN_COLLECTIONS } from '@/shared/const/admin.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

// The first four stats lead the page; the rest sit in a quieter grid below.
const HEADLINE_STATS = 4;

const COLLECTION_LINK_CLASS =
  'group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60';

const StatCard = ({ stat, emphasis }: { stat: AdminStat; emphasis: boolean }) => {
  const { t, intl } = useT();
  return (
    <div className={cn('paper rounded-xl p-5', emphasis && 'sm:p-6')}>
      <p className="text-sm font-medium text-muted-foreground">{t.admin.stats[stat.key] ?? stat.key}</p>
      <p className={cn('mt-1 font-heading font-extrabold leading-none tabular-nums', emphasis ? 'text-4xl sm:text-5xl' : 'text-3xl')}>
        {stat.value.toLocaleString(intl)}
      </p>
    </div>
  );
};

export const AdminOverviewPanel = () => {
  const { t, plural, relative, intl } = useT();
  const { overview, failed } = useAdminOverview();
  const pending = overview?.stats.find((stat) => stat.key === 'pendingVerifications')?.value ?? 0;

  return (
    <div>
      <PageHeading title={t.admin.title} description={t.admin.lead} />

      {failed && <Alert variant="destructive" className="mb-6">{t.admin.errors.loadFailed}</Alert>}

      {!overview ? (
        !failed && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
          </div>
        )
      ) : (
        <div className="space-y-8">
          {pending > 0 && (
            <Alert className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <BadgeCheck className="size-4 shrink-0 text-ink" aria-hidden="true" />
                {t.admin.stats.pendingVerifications}: <strong className="tabular-nums">{pending}</strong>
              </span>
              <Button asChild size="sm">
                <Link href="/admin/verifications">{t.admin.reviewDiplomas}</Link>
              </Button>
            </Alert>
          )}

          <section aria-label={t.admin.overview} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {overview.stats.slice(0, HEADLINE_STATS).map((stat) => <StatCard key={stat.key} stat={stat} emphasis />)}
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {overview.stats.slice(HEADLINE_STATS).map((stat) => <StatCard key={stat.key} stat={stat} emphasis={false} />)}
            <div className="paper rounded-xl p-5">
              <p className="text-sm font-medium text-muted-foreground">{t.admin.averageRating}</p>
              {overview.averageRating === null ? (
                <p className="mt-2 text-sm text-muted-foreground">{t.admin.noRatings}</p>
              ) : (
                <p className="mt-1 flex items-center gap-1.5 font-heading text-3xl font-extrabold leading-none tabular-nums">
                  <Star className="size-5 fill-mark text-mark" aria-hidden="true" />
                  {overview.averageRating.toLocaleString(intl, { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="paper rounded-xl p-5">
              <h2 className="font-heading text-xl font-extrabold">{t.admin.recentUsers}</h2>
              <ul className="mt-3 divide-y divide-rule">
                {overview.recentUsers.map((user) => (
                  <li key={user._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'teacher' ? 'soft' : 'muted'}>
                        {t.admin.roles[user.role] ?? user.role}
                      </Badge>
                      {user.createdAt && <span className="text-xs text-muted-foreground">{relative(user.createdAt)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="paper rounded-xl p-5">
              <h2 className="font-heading text-xl font-extrabold">{t.admin.collectionsHeading}</h2>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {ADMIN_COLLECTIONS.map(({ key }) => (
                  <li key={key}>
                    <Link href={`/admin/${key}`} className={COLLECTION_LINK_CLASS}>
                      <span className="truncate font-medium">{t.admin.collections[key] ?? key}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground tabular-nums">
                        {plural(t.admin.records, overview.collectionCounts[key] ?? 0, {
                          count: (overview.collectionCounts[key] ?? 0).toLocaleString(intl),
                        })}
                        <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
