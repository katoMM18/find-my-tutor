'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type TearTabProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const TEAR_MS = 380;

// A tear-off tab at the foot of a notice. Clicking it tears the tab away, then follows the link.
// Modified clicks (new tab, etc.) and reduced motion skip the tear and behave like a normal link.
export const TearTab = ({ href, children, className }: TearTabProps) => {
  const router = useRouter();
  const [torn, setTorn] = useState(false);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    setTorn(true);
    window.setTimeout(() => router.push(href), TEAR_MS);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'relative z-10 flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold outline-none transition-colors',
        'hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
        torn && 'animate-tear',
        className
      )}
    >
      {children}
    </Link>
  );
};
