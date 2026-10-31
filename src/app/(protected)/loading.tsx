import { Skeleton } from '@/shared/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-64" />
    </div>
  );
}
