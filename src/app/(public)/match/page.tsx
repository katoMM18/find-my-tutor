import { Suspense } from 'react';

import { MatchPage } from '@/features/discovery/components/match-page';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';

export default function MatchRoute() {
  return (
    <>
      <Header />
      <Suspense>
        <MatchPage />
      </Suspense>
      <Footer />
    </>
  );
}
