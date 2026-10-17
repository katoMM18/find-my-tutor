'use client';

import { FileUp } from 'lucide-react';
import { useId, useState } from 'react';

import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type MediaUploadProps = {
  kind: 'profile_image' | 'qualification';
  label: string;
  hint: string;
  accept: string;
  currentUrl?: string | null;
  name?: string;
};

export const MediaUpload = ({ kind, label, hint, accept, currentUrl, name = '' }: MediaUploadProps) => {
  const inputId = useId();
  const { t, fmt } = useT();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setMessage(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('kind', kind);
      body.append('file', file);
      const response = await fetch('/api/media', { method: 'POST', body });
      const result = (await response.json()) as { error?: string; media?: { secureUrl?: string } };
      if (!response.ok) throw new Error(result.error ?? 'UPLOAD_FAILED');
      if (result.media?.secureUrl && kind === 'profile_image') setPreviewUrl(result.media.secureUrl);
      setMessage({ kind: 'success', text: fmt(t.profileEditor.uploaded, { file: file.name }) });
    } catch {
      setMessage({ kind: 'error', text: t.profileEditor.uploadFailed });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {kind === 'profile_image' && <UserAvatar name={name} src={previewUrl ?? currentUrl} size="xl" className="size-20 text-2xl" />}
      <div>
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium shadow-xs',
            'transition-colors hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <FileUp className="size-4" aria-hidden="true" />
          {uploading ? t.profileEditor.uploading : label}
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
        </label>
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        {message && (
          <p className={cn('mt-1 text-xs', message.kind === 'error' ? 'text-destructive' : 'text-primary')}>{message.text}</p>
        )}
      </div>
    </div>
  );
};
