import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { TeacherCard } from '@/features/discovery/components/teacher-card';
import { listTeachersService } from '@/features/discovery/service/teacher-discovery.service';
import { HomeSearch } from '@/features/marketing/components/home-search';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Button } from '@/shared/components/ui/button';
import { ALL_SUBJECTS } from '@/shared/const/subjects.const';
import { i18n } from '@/shared/lib/i18n';
import { getServerI18n } from '@/shared/utils/server-i18n';

export const HomePage = async () => {
  const [featured, { t }] = await Promise.all([
    listTeachersService({ page: 1, limit: 3, sort: 'recommended' }),
    getServerI18n(),
  ]);
  const tutors = 'items' in featured.data ? featured.data : { items: [], total: 0 };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-8 sm:pt-24">
          <h1 className="animate-rise max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            {t.home.titleStart} <span className="text-primary">{t.home.titleAccent}</span> {t.home.titleEnd}
          </h1>
          <p className="animate-rise animate-rise-1 mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t.home.lead}
          </p>
          <div className="animate-rise animate-rise-2 mt-8 max-w-3xl">
            <HomeSearch />
          </div>
          <dl className="animate-rise animate-rise-3 mt-12 grid max-w-3xl grid-cols-3 divide-x divide-border rounded-xl border border-border">
            <div className="px-4 py-4 sm:px-6">
              <dt className="text-sm text-muted-foreground">{t.home.statTutors}</dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">{tutors.total}</dd>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <dt className="text-sm text-muted-foreground">{t.home.statSubjects}</dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">{ALL_SUBJECTS.length}</dd>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <dt className="text-sm text-muted-foreground">{t.home.statFees}</dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">0</dd>
            </div>
          </dl>
        </section>

        {tutors.items.length > 0 && (
          <section aria-labelledby="featured-heading" className="border-t border-border bg-muted/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
              <div className="flex items-end justify-between gap-4">
                <h2 id="featured-heading" className="text-2xl font-bold sm:text-3xl">{t.home.featured}</h2>
                <Link href="/teachers" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
                  {t.home.seeAllTutors} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {tutors.items.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
          <h2 id="how-heading" className="text-2xl font-bold sm:text-3xl">{t.home.howTitle}</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {t.home.steps.map((step, index) => (
              <li key={step.title} className="border-t-2 border-primary pt-4">
                <span className="text-sm font-semibold text-primary">{i18n.format(t.home.step, { number: index + 1 })}</span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="trust-heading" className="border-y border-border bg-foreground text-background">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-8 lg:grid-cols-2">
            <h2 id="trust-heading" className="text-2xl font-bold sm:text-3xl">{t.home.trustTitle}</h2>
            <ul className="space-y-4">
              {t.home.trustPoints.map((point) => (
                <li key={point} className="flex gap-3 leading-relaxed">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-2xl font-bold">{t.home.teachTitle}</h2>
            <p className="mt-1 text-muted-foreground">{t.home.teachLead}</p>
          </div>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-up?role=teacher">{t.nav.becomeTutor}</Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
