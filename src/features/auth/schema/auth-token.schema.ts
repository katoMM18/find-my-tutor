import mongoose, { InferSchemaType, Schema } from 'mongoose';

export const AUTH_TOKEN_PURPOSES = ['verify_email', 'reset_password'] as const;

// One-time secrets for email verification codes and password reset links. Only the SHA-256 hash is stored.
const AuthTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: AUTH_TOKEN_PURPOSES, required: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, required: true, default: 0 },
    usedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

// MongoDB removes expired tokens on its own.
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AuthTokenDocument = InferSchemaType<typeof AuthTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuthTokenModel = mongoose.models.AuthToken || mongoose.model('AuthToken', AuthTokenSchema);
