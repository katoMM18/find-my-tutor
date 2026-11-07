import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { USER_ROLES } from '@/shared/const/roles.const';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false, default: '' },
    avatar: { type: String, required: false },
    role: { type: String, enum: ['teacher', 'student'], default: 'student', required: true },
    // false only for new email sign-ups until they enter their code; accounts from before verification existed have no value.
    emailVerified: { type: Boolean, required: false },
    // Extra permissions such as 'admin', added by hand in MongoDB. Never set by the app.
    roles: { type: [{ type: String, enum: USER_ROLES }], default: [] },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);
