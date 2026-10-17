import { Suspense } from 'react';

import { TeacherDiscoveryPage } from '@/features/discovery/components/teacher-discovery-page';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';

export default function TeachersPage() {
  return (
    <>
      <Header />
      <Suspense>
        <TeacherDiscoveryPage />
      </Suspense>
      <Footer />
    </>
  );
}
