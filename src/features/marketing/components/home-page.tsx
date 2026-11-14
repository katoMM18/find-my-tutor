import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { TeacherRegister } from '@/features/discovery/components/teacher-register';
import { listTeachersService } from '@/features/discovery/service/teacher-discovery.service';
import { HomeSearch } from '@/features/marketing/components/home-search';
import { NoticeBoard } from '@/features/marketing/components/notice-board';
import { OrderDemo } from '@/features/marketing/components/order-demo';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { getServerI18n } from '@/shared/utils/server-i18n';

export const HomePage = async () => {
  const [featured, { t }] = await Promise.all([
    listTeachersService({ page: 1, limit: 5, sort: 'recommended' }),
    getServerI18n(),
  ]);
  const tutors = 'items' in featured.data ? featured.data.items : [];

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Header />

      <main className="flex-1">
        <section className="overflow-x-clip px-4 pb-16 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 lg:pt-8">
              <h1 className="break-words font-heading text-4xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
                {t.home.titleStart} <span className="eraser">{t.home.titleErase}</span>
                {t.home.titleEnd}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.home.lead}</p>
              <div className="mt-8 max-w-2xl">
                <HomeSearch />
              </div>
            </div>
            <div className="lg:col-span-6">
              <NoticeBoard />
            </div>
          </div>
        </section>

        {/* The stairwell paint band: the wall changes colour here, like real stairwell paint. */}
        <div aria-hidden="true" className="h-10 border-t-4 border-foreground/10 bg-wall" />

        <section aria-labelledby="wall-heading" className="px-4 pt-16 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="wall-heading" className="font-heading text-3xl font-extrabold sm:text-4xl">{t.home.featured}</h2>
              <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
                {t.home.seeAllTutors} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {tutors.length > 0 ? (
              <TeacherRegister teachers={tutors} tilted />
            ) : (
              <div className="paper rounded-xl p-8">
                <p className="max-w-xl">{t.home.emptyRegister}</p>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="marks-heading" className="px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="marks-heading" className="font-heading text-3xl font-extrabold sm:text-4xl">{t.home.demoTitle}</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{t.home.demoText}</p>
              <ul className="mt-8 divide-y divide-rule border-y border-rule">
                {t.home.trustPoints.map((point) => (
                  <li key={point} className="py-3 leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <OrderDemo />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
