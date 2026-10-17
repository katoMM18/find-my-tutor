'use client';

import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';

type SaveBarProps = {
  saving: boolean;
  dirty: boolean;
  message: { kind: 'success' | 'error'; text: string } | null;
};

export const SaveBar = ({ saving, dirty, message }: SaveBarProps) => {
  const { t } = useT();

  return (
    <div
      className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-4 border-t border-border bg-background/95
      px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {message && (
        <p role="status" className={message.kind === 'success' ? 'flex items-center gap-1.5 text-sm text-primary' : 'text-sm text-destructive'}>
          {message.kind === 'success' && <CheckCircle2 className="size-4" aria-hidden="true" />}
          {message.text}
        </p>
      )}
      {!message && dirty && <p className="text-sm text-muted-foreground">{t.profileEditor.unsaved}</p>}
      <Button type="submit" disabled={saving}>{saving ? t.profileEditor.saving : t.profileEditor.save}</Button>
    </div>

  );
};
