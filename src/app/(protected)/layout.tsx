import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { auth } from '@/shared/lib/auth';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) redirect('/sign-in');
  // New email sign-ups enter their code before anything else.
  if ((session.user as { isVerified?: boolean } | undefined)?.isVerified === false) redirect('/verify-email');

  return (
    <SessionProvider>
      <StoreProvider>
        <div className="flex h-dvh flex-col">
          <DashboardShell>{children}</DashboardShell>
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}
