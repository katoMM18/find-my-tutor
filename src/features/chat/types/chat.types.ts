export type PublicConversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  participantRole: 'teacher' | 'student';
  participantProfileId: string | null;
  lastMessagePreview: string;
  lastMessageAt?: string;
  unread: boolean;
};

export type PublicMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string;
};
