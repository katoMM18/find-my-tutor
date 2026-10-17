import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ConversationSchema = new Schema(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (value: mongoose.Types.ObjectId[]) => value.length === 2,
        message: 'A conversation must have exactly two participants.',
      },
    },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String, default: '' },
    unreadBy: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', ConversationSchema);
