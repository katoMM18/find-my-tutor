import { APP_NAME } from '@/shared/const/app.const';
import { cn } from '@/shared/lib/utils';

type BrandMarkProps = {
  className?: string;
};

// The TutorConnect mark: a little notice with its tear-off tabs, one already taken.
export const BrandMark = ({ className }: BrandMarkProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0 -rotate-3">
      <rect x="4" y="2" width="24" height="18" rx="2.5" className="fill-primary" />
      <rect x="11" y="0.5" width="10" height="4" rx="1" className="fill-mark" />
      <path d="M9 9.5h14M9 13.5h9" className="stroke-primary-foreground" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 22h6v8.5H5.5A1.5 1.5 0 0 1 4 29zM11 22h6v8.5h-6zM25 22h3v7a1.5 1.5 0 0 1-1.5 1.5H25z" className="fill-primary" />
      <path d="M18 22.5l2 1.5 2-1 1 1.5" fill="none" className="stroke-primary" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="font-heading text-xl font-extrabold tracking-tight">{APP_NAME}</span>
  </span>
);
