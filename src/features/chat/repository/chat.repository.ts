import mongoose from 'mongoose';

import { UserModel } from '@/features/auth/schema/user.schema';
import { ConversationDocument, ConversationModel } from '@/features/chat/schema/conversation.schema';
import { MessageDocument, MessageModel } from '@/features/chat/schema/message.schema';
import { TeacherProfileModel } from '@/features/profiles/schema/teacher-profile.schema';
import { mongo } from '@/shared/lib/mongo';

export const chatRepository = {
  async findUserById(id: string) {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;
    return UserModel.findById(id).select('name avatar role').lean().exec();
  },

  async findTeacherProfileIdByUserId(userId: string): Promise<string | null> {
    await mongo.connect();
    const profile = await TeacherProfileModel.findOne({ userId })
      .select('_id')
      .lean<{ _id: mongoose.Types.ObjectId }>()
      .exec();
    return profile?._id.toString() ?? null;
  },

  async findConversationById(id: string): Promise<ConversationDocument | null> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;
    return ConversationModel.findById(id).lean<ConversationDocument>().exec();
  },

  async findConversationBetween(userId: string, participantId: string) {
    await mongo.connect();
    return ConversationModel.findOne({
      participants: { $all: [userId, participantId] },
    })
      .lean<ConversationDocument>()
      .exec();
  },

  async createConversation(
    participants: mongoose.Types.ObjectId[]
  ): Promise<ConversationDocument> {
    await mongo.connect();
    return ConversationModel.create({ participants }) as Promise<ConversationDocument>;
  },

  async findConversations(userId: string): Promise<ConversationDocument[]> {
    await mongo.connect();
    return ConversationModel.find({ participants: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean<ConversationDocument[]>()
      .exec();
  },

  async updateConversation(
    id: string,
    data: Partial<ConversationDocument>
  ): Promise<void> {
    await mongo.connect();
    await ConversationModel.findByIdAndUpdate(id, { $set: data }).exec();
  },

  async findMessages(
    conversationId: string,
    page: number,
    limit: number
  ): Promise<{ items: MessageDocument[]; total: number }> {
    await mongo.connect();
    const filter = { conversationId };
    const [items, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<MessageDocument[]>()
        .exec(),
      MessageModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async createMessage(data: {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    body: string;
  }): Promise<MessageDocument> {
    await mongo.connect();
    return MessageModel.create(data) as Promise<MessageDocument>;
  },

  async markMessagesRead(conversationId: string, userId: string): Promise<void> {
    await mongo.connect();
    await MessageModel.updateMany(
      { conversationId, senderId: { $ne: userId }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    ).exec();
  },
};
