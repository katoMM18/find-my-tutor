import mongoose from 'mongoose';

import { chatRepository } from '@/features/chat/repository/chat.repository';
import { PublicConversation, PublicMessage } from '@/features/chat/types/chat.types';
import { CreateConversationInput, SendMessageInput } from '@/features/chat/validations/chat.validation';
import { ServiceResult } from '@/shared/types/common';

type ParticipantInfo = {
  name: string;
  avatar: string | null;
  role: 'teacher' | 'student';
  profileId: string | null;
};

const loadParticipant = async (participantId: string | undefined): Promise<ParticipantInfo> => {
  const user = participantId ? await chatRepository.findUserById(participantId) : null;
  const role = user?.role === 'teacher' ? 'teacher' : 'student';
  const profileId =
    participantId && role === 'teacher'
      ? await chatRepository.findTeacherProfileIdByUserId(participantId)
      : null;
  return { name: user?.name ?? 'User', avatar: user?.avatar ?? null, role, profileId };
};

const toConversation = (
  conversation: {
    _id: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    lastMessagePreview?: string;
    lastMessageAt?: Date | null;
    unreadBy?: mongoose.Types.ObjectId[];
  },
  userId: string,
  participant: ParticipantInfo
): PublicConversation => ({
  id: conversation._id.toString(),
  participantId:
    conversation.participants.find((participant) => participant.toString() !== userId)?.toString() ?? '',
  participantName: participant.name,
  participantAvatar: participant.avatar,
  participantRole: participant.role,
  participantProfileId: participant.profileId,
  lastMessagePreview: conversation.lastMessagePreview ?? '',
  lastMessageAt: conversation.lastMessageAt?.toISOString(),
  unread: conversation.unreadBy?.some((participant) => participant.toString() === userId) ?? false,
});

export async function createConversationService(
  userId: string,
  input: CreateConversationInput
): Promise<ServiceResult<PublicConversation>> {
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(input.participantId)) {
    return { data: { error: 'INVALID_PARTICIPANT' }, status: 400 };
  }
  if (userId === input.participantId) {
    return { data: { error: 'SELF_CONVERSATION' }, status: 400 };
  }
  const participantUser = await chatRepository.findUserById(input.participantId);
  if (!participantUser) return { data: { error: 'PARTICIPANT_NOT_FOUND' }, status: 404 };

  const existing = await chatRepository.findConversationBetween(userId, input.participantId);
  const conversation =
    existing ??
    (await chatRepository.createConversation([
      new mongoose.Types.ObjectId(userId),
      new mongoose.Types.ObjectId(input.participantId),
    ]));
  return {
    data: toConversation(conversation, userId, await loadParticipant(input.participantId)),
    status: existing ? 200 : 201,
  };
}

export async function listConversationsService(
  userId: string
): Promise<ServiceResult<PublicConversation[]>> {
  const conversations = await chatRepository.findConversations(userId);
  const data = await Promise.all(
    conversations.map(async (conversation) => {
      const participantId = conversation.participants
        .find((participant) => participant.toString() !== userId)
        ?.toString();
      return toConversation(conversation, userId, await loadParticipant(participantId));
    })
  );
  return { data, status: 200 };
}

export async function listMessagesService(
  userId: string,
  conversationId: string,
  page: number,
  limit: number
): Promise<ServiceResult<{ items: PublicMessage[]; total: number; page: number; limit: number }>> {
  const conversation = await chatRepository.findConversationById(conversationId);
  if (!conversation) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!conversation.participants.some((participant) => participant.toString() === userId)) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }
  const result = await chatRepository.findMessages(conversationId, page, limit);
  return {
    data: {
      items: [...result.items].reverse().map((message) => ({
        id: message._id.toString(),
        senderId: message.senderId.toString(),
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        readAt: message.readAt?.toISOString(),
      })),
      total: result.total,
      page,
      limit,
    },
    status: 200,
  };
}

export async function sendMessageService(
  userId: string,
  conversationId: string,
  input: SendMessageInput
): Promise<ServiceResult<PublicMessage>> {
  const conversation = await chatRepository.findConversationById(conversationId);
  if (!conversation) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!conversation.participants.some((participant) => participant.toString() === userId)) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }
  const now = new Date();
  const message = await chatRepository.createMessage({
    conversationId: new mongoose.Types.ObjectId(conversationId),
    senderId: new mongoose.Types.ObjectId(userId),
    body: input.body,
  });
  const unreadBy = conversation.participants.filter(
    (participant) => participant.toString() !== userId
  );
  await chatRepository.updateConversation(conversationId, {
    lastMessageAt: now,
    lastMessagePreview: input.body.slice(0, 120),
    unreadBy,
  });
  return {
    data: {
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
    status: 201,
  };
}

export async function markConversationReadService(
  userId: string,
  conversationId: string
): Promise<ServiceResult<{ message: string }>> {
  const conversation = await chatRepository.findConversationById(conversationId);
  if (!conversation) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!conversation.participants.some((participant) => participant.toString() === userId)) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }
  await chatRepository.markMessagesRead(conversationId, userId);
  await chatRepository.updateConversation(conversationId, {
    unreadBy: conversation.unreadBy?.filter(
      (participant) => participant.toString() !== userId
    ),
  });
  return { data: { message: 'Conversation marked read' }, status: 200 };
}
