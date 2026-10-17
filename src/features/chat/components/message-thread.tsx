'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { MessageComposer } from '@/features/chat/components/message-composer';
import { ThreadReviewBanner } from '@/features/chat/components/thread-review-banner';
import { useMessages } from '@/features/chat/hooks/use-messages';
import { PublicConversation } from '@/features/chat/types/chat.types';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type MessageThreadProps = {
  conversation: PublicConversation;
  currentUserId: string;
  role: 'teacher' | 'student';
  onBack: () => void;
  onActivity: () => void;
};

export const MessageThread = ({ conversation, currentUserId, role, onBack, onActivity }: MessageThreadProps) => {
  const { messages, loading, error, send } = useMessages(conversation.id, onActivity);
  const endRef = useRef<HTMLDivElement>(null);
  const { t, fmt, dateTime } = useT();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <section aria-label={fmt(t.chat.conversationWith, { name: conversation.participantName })} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <Button type="button" variant="ghost" size="icon-sm" className="md:hidden" onClick={onBack} aria-label={t.chat.back}>
          <ArrowLeft className="size-4" />
        </Button>
        <UserAvatar name={conversation.participantName} src={conversation.participantAvatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation.participantName}</p>
          <p className="text-xs text-muted-foreground">{conversation.participantRole === 'teacher' ? t.common.teacher : t.common.student}</p>
        </div>
        {conversation.participantProfileId && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/teachers/${conversation.participantProfileId}`}>{t.common.viewProfile}</Link>
          </Button>
        )}
      </div>
      <ThreadReviewBanner
        role={role}
        participantId={conversation.participantId}
        participantName={conversation.participantName}
        participantProfileId={conversation.participantProfileId}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-4" aria-live="polite">
        {loading && <p className="m-auto text-sm text-muted-foreground">{t.chat.loadingMessages}</p>}
        {!loading && messages.length === 0 && (
          <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">
            {t.chat.sayHello}
          </p>
        )}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn('flex max-w-4/5 flex-col', mine ? 'items-end self-end' : 'items-start')}>
              <p
                className={cn(
                  'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted'
                )}
              >
                {message.body}
              </p>
              <time className="mt-1 px-1 text-xs text-muted-foreground" dateTime={message.createdAt}>
                {dateTime(message.createdAt)}
              </time>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
      <MessageComposer onSend={send} />
    </section>
  );
};
