import { MessagesSquare } from 'lucide-react';
import Link from 'next/link';

import { PublicConversation } from '@/features/chat/types/chat.types';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type ConversationListProps = {
  conversations: PublicConversation[];
  loading: boolean;
  error: boolean;
  selectedId: string | null;
  role: 'teacher' | 'student';
  onSelect: (id: string) => void;
  onRetry: () => void;
};

export const ConversationList = ({
  conversations,
  loading,
  error,
  selectedId,
  role,
  onSelect,
  onRetry,
}: ConversationListProps) => {
  const { t, relative } = useT();

  if (loading) {
    return (
      <div className="space-y-1 p-2" aria-busy="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-md p-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <MessagesSquare className="size-8 text-destructive" aria-hidden="true" />
        <p className="font-heading text-base font-semibold">{t.chat.loadError}</p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          {t.common.tryAgain}
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <MessagesSquare className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-heading text-base font-semibold">{t.chat.emptyTitle}</p>
        <p className="max-w-60 text-sm text-muted-foreground">
          {role === 'student' ? t.chat.emptyStudent : t.chat.emptyTeacher}
        </p>
        <Button asChild size="sm">
          <Link href={role === 'student' ? '/teachers' : '/students'}>
            {role === 'student' ? t.chat.findTutor : t.chat.browseStudents}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onSelect(conversation.id)}
            aria-current={conversation.id === selectedId ? 'true' : undefined}
            className={cn(
              'h-auto w-full justify-start gap-3 whitespace-normal rounded-lg p-3 text-left font-normal',
              conversation.id === selectedId && 'bg-primary/10'
            )}
          >
            <UserAvatar name={conversation.participantName} src={conversation.participantAvatar} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={cn('truncate text-sm', conversation.unread ? 'font-semibold' : 'font-medium')}>
                  {conversation.participantName}
                </span>
                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-xs text-muted-foreground">{relative(conversation.lastMessageAt)}</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <span className={cn('truncate text-sm', conversation.unread ? 'text-foreground' : 'text-muted-foreground')}>
                  {conversation.lastMessagePreview || t.chat.noMessages}
                </span>
                {conversation.unread && <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" aria-label={t.common.unread} />}
              </span>
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
};
