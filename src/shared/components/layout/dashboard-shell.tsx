'use client';
import { useState, type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';
import { LanguageSwitcher } from '@/shared/components/layout/language-switcher';
import { Sidebar } from '@/shared/components/layout/sidebar';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useT } from '@/shared/hooks/use-t';

type DashboardShellProps = {
  children: ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useT();

  return (
    <>
      <Header onOpenMenu={() => setOpen(true)} menuOpen={open} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar className="hidden lg:flex" />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" closeLabel={t.common.closeNavigation} className="lg:hidden">
            <SheetHeader>
              <SheetTitle>{t.common.navigation}</SheetTitle>
            </SheetHeader>
            <Sidebar className="m-0 w-full flex-1 rounded-none border-0 bg-transparent shadow-none " onNavigate={() => setOpen(false)} />
            <div className="flex items-center gap-2 border-t border-rule p-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
};
