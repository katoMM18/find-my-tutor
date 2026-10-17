'use client';

import { MessagesSquare } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { ConversationList } from '@/features/chat/components/conversation-list';
import { MessageThread } from '@/features/chat/components/message-thread';
import { useConversations } from '@/features/chat/hooks/use-conversations';
import { PublicConversation } from '@/features/chat/types/chat.types';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export const MessagesInbox = () => {
  const { data: session } = useSession();
  const { t } = useT();
  const sessionUser = session?.user as SessionUser | undefined;
  const role = sessionUser?.role === 'teacher' ? 'teacher' : 'student';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('c');
  const startWith = searchParams.get('to');
  const { conversations, loading, error, reload } = useConversations();
  const startedRef = useRef<string | null>(null);
  const [startErrorId, setStartErrorId] = useState<string | null>(null);
  const [startAttempt, setStartAttempt] = useState(0);
  const startError = startWith !== null && startErrorId === startWith;

  const select = (id: string | null) => router.replace(id ? `${pathname}?c=${id}` : pathname, { scroll: false });

  useEffect(() => {
    if (!startWith || startedRef.current === startWith) return;
    startedRef.current = startWith;
    void http
      .post<PublicConversation>('/conversations', { participantId: startWith })
      .then(async (conversation) => {
        await reload();
        router.replace(`${pathname}?c=${conversation.id}`, { scroll: false });
      })
      .catch(() => {
        startedRef.current = null;
        setStartErrorId(startWith);
      });
  }, [pathname, reload, router, startAttempt, startWith]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
      <aside
        aria-label={t.chat.conversations}
        className={cn('flex w-full flex-col border-border md:w-80 md:shrink-0 md:border-r', selectedId && 'hidden md:flex')}
      >
        <h1 className="border-b border-border px-4 py-3 text-lg font-semibold">{t.chat.title}</h1>
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          selectedId={selectedId}
          role={role}
          onSelect={select}
          onRetry={() => void reload().catch(() => undefined)}
        />
      </aside>
      <div className={cn('min-w-0 flex-1 flex-col', selectedId ? 'flex' : 'hidden md:flex')}>
        {selected && sessionUser?.id ? (
          <MessageThread
            key={selected.id}
            conversation={selected}
            currentUserId={sessionUser.id}
            role={role}
            onBack={() => select(null)}
            onActivity={reload}
          />
        ) : (
          <div className="m-auto flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
            <MessagesSquare className="size-8" aria-hidden="true" />
            <p className="text-sm">
              {startError ? t.chat.loadError : selectedId && loading ? t.chat.opening : t.chat.pick}
            </p>
            {startError && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  startedRef.current = null;
                  setStartErrorId(null);
                  setStartAttempt((attempt) => attempt + 1);
                }}
              >
                {t.common.tryAgain}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
