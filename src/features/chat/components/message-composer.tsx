'use client';

import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';

type MessageComposerProps = {
  onSend: (body: string) => Promise<boolean>;
};

export const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const { t } = useT();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    const ok = await onSend(body);
    if (ok) setBody('');
    setSending(false);
  };

  return (
    <form
      className="flex items-end gap-2 border-t border-border p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <Textarea
        value={body}
        rows={1}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void send();
          }
        }}
        placeholder={t.chat.placeholder}
        aria-label={t.common.message}
        className="max-h-40 min-h-10 resize-none"
      />
      <Button type="submit" size="icon" disabled={!body.trim() || sending} aria-label={t.chat.send}>
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  );
};
