import mongoose, { InferSchemaType, Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      immutable: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export type MessageDocument = InferSchemaType<typeof MessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MessageModel =
  mongoose.models.Message || mongoose.model('Message', MessageSchema);
