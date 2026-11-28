import Link from 'next/link';
import { type ReactNode } from 'react';

type DashboardPanelProps = {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
};

export const DashboardPanel = ({ title, action, children }: DashboardPanelProps) => (
  <section className="rounded-lg paper">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-rule px-5 py-3.5">
      <h2 className="min-w-0 text-lg font-bold">{title}</h2>
      {action && (
        <Link href={action.href} className="shrink-0 whitespace-nowrap text-sm font-semibold text-ink hover:underline">
          {action.label}
        </Link>
      )}
    </div>
    <div className="p-5">{children}</div>
  </section>
);
