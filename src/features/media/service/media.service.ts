import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';
import sharp from 'sharp';

import { userRepository } from '@/features/auth/repository/user.repository';
import { mediaRepository } from '@/features/media/repository/media.repository';
import { MediaDocument } from '@/features/media/schema/media.schema';
import { ServiceResult } from '@/shared/types/common';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENTS = ['application/pdf', 'image/jpeg', 'image/png'];

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured');
  return { cloudName, apiKey, apiSecret };
};

type UploadKind = 'profile_image' | 'qualification';

type UploadedMedia = {
  kind: UploadKind;
  file: File;
};

const processImage = async (buffer: Buffer) => {
  const image = sharp(buffer).rotate().resize({
    width: MAX_IMAGE_DIMENSION,
    height: MAX_IMAGE_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });

  for (const quality of [78, 65, 50, 40]) {
    const processed = await image.webp({ quality, effort: 6 }).toBuffer({ resolveWithObject: true });
    if (processed.data.byteLength <= MAX_FILE_BYTES) return processed;
  }

  return null;
};

const uploadToCloudinary = async (
  userId: string,
  kind: UploadKind,
  buffer: Buffer,
  mimeType: string,
  publicId: string
) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `tutorconnect/${kind}/${userId}`;
  const resourceType: 'image' | 'raw' = mimeType === 'image/webp' ? 'image' : 'raw';
  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(signatureBase).digest('hex');
  const body = new FormData();
  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(buffer);
  body.append('file', new Blob([bytes.buffer], { type: mimeType }));
  body.append('api_key', apiKey);
  body.append('timestamp', String(timestamp));
  body.append('signature', signature);
  body.append('folder', folder);
  body.append('public_id', publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body }
  );
  if (!response.ok) throw new Error('Cloudinary upload failed');
  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error('Cloudinary did not return a file URL');

  return { resourceType, folder, secureUrl: result.secure_url };
};

export async function uploadMediaService(
  userId: string,
  input: UploadedMedia
): Promise<ServiceResult<{ media: MediaDocument }>> {
  const { kind, file } = input;
  const allowedTypes = kind === 'profile_image' ? ALLOWED_IMAGES : ALLOWED_DOCUMENTS;
  if (!allowedTypes.includes(file.type)) return { data: { error: 'UNSUPPORTED_FILE_TYPE' }, status: 400 };
  if (file.size > MAX_FILE_BYTES) return { data: { error: 'FILE_TOO_LARGE' }, status: 400 };

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  let buffer = originalBuffer;
  let mimeType = file.type;
  let width: number | undefined;
  let height: number | undefined;

  if (file.type.startsWith('image/')) {
    const processed = await processImage(originalBuffer);
    if (!processed) return { data: { error: 'PROCESSED_FILE_TOO_LARGE' }, status: 400 };
    buffer = processed.data;
    mimeType = 'image/webp';
    width = processed.info.width;
    height = processed.info.height;
  }

  if (buffer.byteLength > MAX_FILE_BYTES) {
    return { data: { error: 'PROCESSED_FILE_TOO_LARGE' }, status: 400 };
  }

  const publicId = `${randomUUID()}-${file.name.replace(/\W+/g, '-').toLowerCase()}`;
  const uploaded = await uploadToCloudinary(userId, kind, buffer, mimeType, publicId);
  if (kind === 'profile_image') {
    await userRepository.updateById(userId, { avatar: uploaded.secureUrl });
  }
  const media = await mediaRepository.create({
    ownerId: new mongoose.Types.ObjectId(userId),
    kind,
    publicId,
    secureUrl: uploaded.secureUrl,
    resourceType: uploaded.resourceType,
    mimeType,
    bytes: buffer.byteLength,
    width,
    height,
  });

  return { data: { media }, status: 201 };
}

export async function deleteMediaService(userId: string, mediaId: string): Promise<ServiceResult<{ deleted: true }>> {
  const media = await mediaRepository.findByIdForOwner(mediaId, userId);
  if (!media) return { data: { error: 'NOT_FOUND' }, status: 404 };
  await mediaRepository.deleteByIdForOwner(mediaId, userId);
  return { data: { deleted: true }, status: 200 };
}

export async function listMediaService(userId: string): Promise<ServiceResult<MediaDocument[]>> {
  const media = await mediaRepository.findAllForOwner(userId);
  const profileImage = media.find((item) => item.kind === 'profile_image');
  if (profileImage) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const profileUrl =
      profileImage.secureUrl ??
      (cloudName
        ? `https://res.cloudinary.com/${cloudName}/image/upload/${profileImage.publicId}`
        : null);
    if (profileUrl) {
      await userRepository.updateById(userId, { avatar: profileUrl });
    }
  }
  return { data: media, status: 200 };
}

export async function getPrivateMediaUrlService(
  userId: string,
  mediaId: string
): Promise<ServiceResult<{ url: string }>> {
  const media = await mediaRepository.findByIdForOwner(mediaId, userId);
  if (!media) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const { cloudName, apiSecret } = getCloudinaryConfig();
  const resourcePath = `${media.resourceType}/upload/${media.publicId}`;
  const signature = createHash('sha1')
    .update(`${resourcePath}${apiSecret}`)
    .digest('hex')
    .slice(0, 8);

  return {
    data: {
      url: `https://res.cloudinary.com/${cloudName}/${media.resourceType}/upload/s--${signature}--/${media.publicId}`,
    },
    status: 200,
  };
}
