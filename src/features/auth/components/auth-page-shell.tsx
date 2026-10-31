import { type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';

type AuthPageShellProps = {
  children: ReactNode;
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => {
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <Header />

      <main className="relative flex flex-1 items-start justify-center px-4 pb-16">
        <div className="relative mt-10 flex w-full justify-center">{children}</div>
      </main>
    </div>
  );
};
