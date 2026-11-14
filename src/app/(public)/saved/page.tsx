import { ShortlistPage } from '@/features/shortlist/components/shortlist-page';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';

export default function SavedRoute() {
  return (
    <>
      <Header />
      <ShortlistPage />
      <Footer />
    </>
  );
}
