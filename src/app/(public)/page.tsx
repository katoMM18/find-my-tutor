import { HomePage } from '@/features/marketing/components/home-page';

export const dynamic = 'force-dynamic';

// Everyone can open the home page, signed in or not; the dashboard is one click away in the header.
export default function Page() {
  return <HomePage />;
}
