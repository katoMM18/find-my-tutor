'use client';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <h2 className="text-2xl font-bold">{t.common.somethingWentWrong}</h2>
      <p className="text-muted-foreground">{t.common.unexpectedError}</p>
      <Button onClick={reset}>{t.common.tryAgain}</Button>
    </div>
  );
}
