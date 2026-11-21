import { adminRepository } from '@/features/admin/repository/admin.repository';
import {
  type AdminCollection,
  type AdminCollectionKey,
  type AdminDocument,
  type AdminDocumentPage,
  type AdminJsonValue,
  type AdminOverview,
  type AdminRawDocument,
  type AdminRawValue,
  type AdminSearchFilter,
  type AdminStat,
} from '@/features/admin/types/admin.types';
import {
  AdminObjectIdSchema,
  parseAdminValues,
  type AdminDocumentBodyType,
  type AdminFieldError,
  type AdminListQueryType,
} from '@/features/admin/validations/admin.validation';
import { ADMIN_COLLECTION_KEYS, ADMIN_COLLECTIONS, ADMIN_PAGE_SIZE } from '@/shared/const/admin.const';
import { type ServiceResult } from '@/shared/types/common';
import { hashPassword } from '@/shared/utils/password';

const NEW_USER_WINDOW_DAYS = 7;
const RECENT_USERS = 6;

// Never sent to the browser, whatever the collection.
const SECRET_KEYS = new Set(['passwordHash', 'tokenHash', '__v']);

type AdminErrorBody = { error: string; field?: string; reason?: AdminFieldError['reason'] | string };

const findCollection = (key: AdminCollectionKey): AdminCollection | undefined =>
  ADMIN_COLLECTIONS.find((collection) => collection.key === key);

const isObjectIdLike = (value: object): boolean => '_bsontype' in value && value._bsontype === 'ObjectId';

const toJson = (value: AdminRawValue): AdminJsonValue => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toJson);
  if (typeof value === 'object') {
    if (isObjectIdLike(value)) return value.toString();
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, toJson(entry)]));
  }
  return value;
};

export const serializeAdminDocument = (raw: AdminRawDocument): AdminDocument => {
  const document: AdminDocument = { _id: raw._id.toString() };
  for (const [key, value] of Object.entries(raw)) {
    if (key === '_id' || SECRET_KEYS.has(key)) continue;
    document[key] = toJson(value);
  }
  return document;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchFilter = (collection: AdminCollection, q: string): AdminSearchFilter => {
  if (!q) return {};
  if (AdminObjectIdSchema.safeParse(q).success) return { _id: q };
  if (collection.searchKeys.length === 0) return { _id: '000000000000000000000000' };
  const pattern = escapeRegex(q);
  return { $or: collection.searchKeys.map((key) => ({ [key]: { $regex: pattern, $options: 'i' } })) };
};

// Mongoose validation, cast and duplicate-key failures become a 400/409 with a readable reason.
const writeError = (error: unknown): { data: AdminErrorBody; status: number } => {
  if (error instanceof Error) {
    if ('code' in error && error.code === 11000) return { data: { error: 'DUPLICATE', reason: error.message }, status: 409 };
    if (error.name === 'ValidationError' || error.name === 'CastError' || error.name === 'StrictModeError') {
      return { data: { error: 'INVALID_DOCUMENT', reason: error.message }, status: 400 };
    }
  }
  return { data: { error: 'WRITE_FAILED' }, status: 500 };
};

const fieldError = (error: AdminFieldError) => ({ data: { error: 'INVALID_FIELD', field: error.field, reason: error.reason }, status: 400 });

export async function getAdminOverviewService(): Promise<ServiceResult<AdminOverview>> {
  const since = new Date(Date.now() - NEW_USER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [users, students, tutors, admins, verifiedTutors, pendingVerifications, vipTutors, openRequests, conversations, messages, ratings, newUsers] =
    await Promise.all([
      adminRepository.count('users'),
      adminRepository.count('users', { role: 'student' }),
      adminRepository.count('users', { role: 'teacher' }),
      adminRepository.count('users', { role: 'admin' }),
      adminRepository.count('teacherProfiles', { verified: true }),
      adminRepository.count('tutorVerifications', { status: 'pending' }),
      adminRepository.count('vipSubscriptions', { status: { $ne: 'none' } }),
      adminRepository.count('studentRequests', { status: 'open' }),
      adminRepository.count('conversations'),
      adminRepository.count('messages'),
      adminRepository.count('ratings'),
      adminRepository.count('users', { createdAt: { $gte: since } }),
    ]);

  const [averageRating, recent, counts] = await Promise.all([
    adminRepository.averageRating(),
    adminRepository.recentUsers(RECENT_USERS),
    Promise.all(ADMIN_COLLECTION_KEYS.map((key) => adminRepository.count(key))),
  ]);

  const stats: AdminStat[] = [
    { key: 'users', value: users },
    { key: 'students', value: students },
    { key: 'tutors', value: tutors },
    { key: 'admins', value: admins },
    { key: 'newUsers', value: newUsers },
    { key: 'verifiedTutors', value: verifiedTutors },
    { key: 'pendingVerifications', value: pendingVerifications },
    { key: 'vipTutors', value: vipTutors },
    { key: 'openRequests', value: openRequests },
    { key: 'conversations', value: conversations },
    { key: 'messages', value: messages },
    { key: 'ratings', value: ratings },
  ];

  const collectionCounts = Object.fromEntries(ADMIN_COLLECTION_KEYS.map((key, index) => [key, counts[index]])) as Record<AdminCollectionKey, number>;

  const recentUsers = recent.map((user) => {
    const plain = serializeAdminDocument(user);
    return {
      _id: plain._id,
      name: typeof plain.name === 'string' ? plain.name : '',
      email: typeof plain.email === 'string' ? plain.email : '',
      role: typeof plain.role === 'string' ? plain.role : 'student',
      createdAt: typeof plain.createdAt === 'string' ? plain.createdAt : null,
    };
  });

  return { data: { stats, averageRating, collectionCounts, recentUsers }, status: 200 };
}

export async function listAdminDocumentsService(key: AdminCollectionKey, query: AdminListQueryType): Promise<ServiceResult<AdminDocumentPage>> {
  const collection = findCollection(key);
  if (!collection) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const filter = buildSearchFilter(collection, query.q);
  const skip = (query.page - 1) * ADMIN_PAGE_SIZE;
  const [items, total] = await Promise.all([
    adminRepository.list(key, filter, skip, ADMIN_PAGE_SIZE),
    adminRepository.count(key, filter),
  ]);

  return { data: { items: items.map(serializeAdminDocument), total, page: query.page, limit: ADMIN_PAGE_SIZE }, status: 200 };
}

export async function getAdminDocumentService(key: AdminCollectionKey, id: string): Promise<ServiceResult<AdminDocument>> {
  if (!AdminObjectIdSchema.safeParse(id).success) return { data: { error: 'NOT_FOUND' }, status: 404 };
  const document = await adminRepository.findById(key, id);
  if (!document) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: serializeAdminDocument(document), status: 200 };
}

export async function createAdminDocumentService(
  key: AdminCollectionKey,
  input: AdminDocumentBodyType
): Promise<ServiceResult<AdminDocument>> {
  const collection = findCollection(key);
  if (!collection) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!collection.canCreate) return { data: { error: 'NOT_ALLOWED' }, status: 405 };

  const parsed = parseAdminValues(collection.fields, input.values, 'create');
  if (!parsed.ok) return fieldError(parsed.error);

  const data = { ...parsed.data };
  if (key === 'users') {
    if (typeof data.password !== 'string') return fieldError({ field: 'password', reason: 'REQUIRED' });
    data.passwordHash = hashPassword(data.password);
    delete data.password;
  }

  try {
    const id = await adminRepository.create(key, data);
    const created = await adminRepository.findById(key, id);
    if (!created) return { data: { error: 'WRITE_FAILED' }, status: 500 };
    return { data: serializeAdminDocument(created), status: 201 };
  } catch (error) {
    return writeError(error);
  }
}

export async function updateAdminDocumentService(
  key: AdminCollectionKey,
  id: string,
  input: AdminDocumentBodyType,
  actorId: string
): Promise<ServiceResult<AdminDocument>> {
  const collection = findCollection(key);
  if (!collection) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!collection.canEdit) return { data: { error: 'NOT_ALLOWED' }, status: 405 };
  if (!AdminObjectIdSchema.safeParse(id).success) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const existing = await adminRepository.findById(key, id);
  if (!existing) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const parsed = parseAdminValues(collection.fields, input.values, 'update');
  if (!parsed.ok) return fieldError(parsed.error);

  const data = { ...parsed.data };
  if (key === 'users') {
    // An admin cannot take the admin role away from themselves and lock everyone out.
    if (id === actorId && existing.role === 'admin' && data.role !== undefined && data.role !== 'admin') {
      return { data: { error: 'CANNOT_DEMOTE_SELF' }, status: 403 };
    }
    if (typeof data.password === 'string') data.passwordHash = hashPassword(data.password);
    delete data.password;
  }

  try {
    const updated = await adminRepository.updateById(key, id, data);
    if (!updated) return { data: { error: 'NOT_FOUND' }, status: 404 };
    return { data: serializeAdminDocument(updated), status: 200 };
  } catch (error) {
    return writeError(error);
  }
}

export async function deleteAdminDocumentService(
  key: AdminCollectionKey,
  id: string,
  actorId: string
): Promise<ServiceResult<{ deleted: true }>> {
  const collection = findCollection(key);
  if (!collection) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!collection.canDelete) return { data: { error: 'NOT_ALLOWED' }, status: 405 };
  if (!AdminObjectIdSchema.safeParse(id).success) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (key === 'users' && id === actorId) return { data: { error: 'CANNOT_DELETE_SELF' }, status: 403 };

  const deleted = await adminRepository.deleteById(key, id);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}
