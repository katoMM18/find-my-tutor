import { Suspense } from 'react';

import { MessagesInbox } from '@/features/chat/components/messages-inbox';

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInbox />
    </Suspense>
  );
}
