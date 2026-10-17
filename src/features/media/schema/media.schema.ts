import mongoose, { InferSchemaType, Schema } from 'mongoose';

const MediaSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['profile_image', 'qualification'], required: true },
    publicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: false },
    resourceType: { type: String, enum: ['image', 'raw'], required: true },
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
  },
  { timestamps: true }
);

export type MediaDocument = InferSchemaType<typeof MediaSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MediaModel = mongoose.models.Media || mongoose.model('Media', MediaSchema);
