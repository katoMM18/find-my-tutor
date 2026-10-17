import Link from 'next/link';
import { type ReactNode } from 'react';

type DashboardPanelProps = {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
};

export const DashboardPanel = ({ title, action, children }: DashboardPanelProps) => (
  <section className="rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
      <h2 className="text-base font-semibold">{title}</h2>
      {action && (
        <Link href={action.href} className="text-sm font-medium text-primary hover:underline">
          {action.label}
        </Link>
      )}
    </div>
    <div className="p-5">{children}</div>
  </section>
);
