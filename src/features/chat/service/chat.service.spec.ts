import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/chat/repository/chat.repository', () => ({
  chatRepository: {
    findUserById: vi.fn(),
    findConversationById: vi.fn(),
    findConversationBetween: vi.fn(),
    createConversation: vi.fn(),
    findConversations: vi.fn(),
    updateConversation: vi.fn(),
    findMessages: vi.fn(),
    createMessage: vi.fn(),
    markMessagesRead: vi.fn(),
  },
}));

import { chatRepository } from '@/features/chat/repository/chat.repository';

import {
  createConversationService,
  listMessagesService,
  sendMessageService,
} from './chat.service';

const mockRepository = vi.mocked(chatRepository);
const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const conversationId = '507f1f77bcf86cd799439013';

const conversation = {
  _id: new mongoose.Types.ObjectId(conversationId),
  participants: [
    new mongoose.Types.ObjectId(userId),
    new mongoose.Types.ObjectId(otherUserId),
  ],
  unreadBy: [],
};

describe('chat service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a conversation with the requested participant', async () => {
    mockRepository.findUserById.mockResolvedValueOnce({ name: 'Teacher' } as never);
    mockRepository.findConversationBetween.mockResolvedValueOnce(null);
    mockRepository.createConversation.mockResolvedValueOnce(conversation as never);

    const result = await createConversationService(userId, {
      participantId: otherUserId,
    });

    expect(result.status).toBe(201);
    expect(mockRepository.createConversation).toHaveBeenCalledOnce();
  });

  it('rejects message reads for a non-participant', async () => {
    mockRepository.findConversationById.mockResolvedValueOnce({
      ...conversation,
      participants: [new mongoose.Types.ObjectId(otherUserId)],
    } as never);

    const result = await listMessagesService(userId, conversationId, 1, 50);

    expect(result).toEqual({ data: { error: 'FORBIDDEN' }, status: 403 });
  });

  it('sends a message and marks the other participant unread', async () => {
    mockRepository.findConversationById.mockResolvedValueOnce(conversation as never);
    mockRepository.createMessage.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(userId),
      body: 'Hello',
      createdAt: new Date(),
    } as never);

    const result = await sendMessageService(userId, conversationId, { body: 'Hello' });

    expect(result.status).toBe(201);
    expect(mockRepository.updateConversation).toHaveBeenCalledWith(
      conversationId,
      expect.objectContaining({ lastMessagePreview: 'Hello' })
    );
  });
});
