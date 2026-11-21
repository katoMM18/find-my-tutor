import { APP_NAME } from '@/shared/const/app.const';
import { cn } from '@/shared/lib/utils';

type BrandMarkProps = {
  className?: string;
};

// The Find My Tutor mark: a tutor and a student (red) sharing one open book.
export const BrandMark = ({ className }: BrandMarkProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
      <circle cx="10" cy="7.5" r="4.3" className="fill-logo" />
      <circle cx="22" cy="9.3" r="3.4" className="fill-mark" />
      <path d="M2.5 17.5C6.5 15.2 11.5 15.4 15.2 17.8V29C11.5 26.6 6.5 26.4 2.5 28.7Z" className="fill-logo" />
      <path d="M16.8 17.8C20.5 15.4 25.5 15.2 29.5 17.5V28.7C25.5 26.4 20.5 26.6 16.8 29Z" className="fill-logo" />
    </svg>
    <span className="font-heading text-xl font-extrabold tracking-tight">{APP_NAME}</span>
  </span>
);
