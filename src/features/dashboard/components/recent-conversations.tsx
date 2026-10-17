'use client';

import Link from 'next/link';

import { PublicConversation } from '@/features/chat/types/chat.types';
import { DashboardPanel } from '@/features/dashboard/components/dashboard-panel';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type RecentConversationsProps = {
  conversations: PublicConversation[];
  loading: boolean;
  emptyText: string;
};

export const RecentConversations = ({ conversations, loading, emptyText }: RecentConversationsProps) => {
  const { t, relative } = useT();

  return (
    <DashboardPanel title={t.dashboard.recentMessages} action={{ href: '/messages', label: t.dashboard.openInbox }}>
      {loading ? (
        <div className="h-12 animate-pulse rounded-md bg-muted" aria-busy="true" />
      ) : conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="-mx-2 space-y-0.5">
          {conversations.slice(0, 4).map((conversation) => (
            <li key={conversation.id}>
              <Link href={`/messages?c=${conversation.id}`} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                <UserAvatar name={conversation.participantName} src={conversation.participantAvatar} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm', conversation.unread ? 'font-semibold' : 'font-medium')}>
                    {conversation.participantName}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">{conversation.lastMessagePreview || t.chat.noMessages}</span>
                </span>
                {conversation.unread && <span className="size-2 rounded-full bg-primary" aria-label={t.common.unread} />}
                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-xs text-muted-foreground">{relative(conversation.lastMessageAt)}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>

  );
};
