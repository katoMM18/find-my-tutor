import { AuthTokenDocument, AuthTokenModel } from '@/features/auth/schema/auth-token.schema';
import { mongo } from '@/shared/lib/mongo';

type AuthTokenPurpose = AuthTokenDocument['purpose'];

export const authTokenRepository = {
  async create(data: { userId: string; purpose: AuthTokenPurpose; tokenHash: string; expiresAt: Date }): Promise<void> {
    await mongo.connect();
    await AuthTokenModel.create(data);
  },

  async findLatestActive(userId: string, purpose: AuthTokenPurpose): Promise<AuthTokenDocument | null> {
    await mongo.connect();
    return AuthTokenModel.findOne({ userId, purpose, usedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .lean<AuthTokenDocument>()
      .exec();
  },

  async findActiveByHash(tokenHash: string, purpose: AuthTokenPurpose): Promise<AuthTokenDocument | null> {
    await mongo.connect();
    return AuthTokenModel.findOne({ tokenHash, purpose, usedAt: null, expiresAt: { $gt: new Date() } })
      .lean<AuthTokenDocument>()
      .exec();
  },

  async incrementAttempts(id: string): Promise<void> {
    await mongo.connect();
    await AuthTokenModel.updateOne({ _id: id }, { $inc: { attempts: 1 } });
  },

  async markUsed(id: string): Promise<void> {
    await mongo.connect();
    await AuthTokenModel.updateOne({ _id: id }, { $set: { usedAt: new Date() } });
  },

  async invalidateAll(userId: string, purpose: AuthTokenPurpose): Promise<void> {
    await mongo.connect();
    await AuthTokenModel.updateMany({ userId, purpose, usedAt: null }, { $set: { usedAt: new Date() } });
  },
};
