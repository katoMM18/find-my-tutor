import { MediaDocument, MediaModel } from '@/features/media/schema/media.schema';
import { mongo } from '@/shared/lib/mongo';

export const mediaRepository = {
  async create(data: Omit<MediaDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<MediaDocument> {
    await mongo.connect();
    return MediaModel.create(data);
  },

  async findByIdForOwner(id: string, ownerId: string): Promise<MediaDocument | null> {
    await mongo.connect();
    return MediaModel.findOne({ _id: id, ownerId }).lean<MediaDocument>().exec();
  },

  async findAllForOwner(ownerId: string): Promise<MediaDocument[]> {
    await mongo.connect();
    return MediaModel.find({ ownerId }).sort({ createdAt: -1 }).lean<MediaDocument[]>().exec();
  },

  async deleteByIdForOwner(id: string, ownerId: string) {
    await mongo.connect();
    return MediaModel.deleteOne({ _id: id, ownerId }).exec();
  },
};
