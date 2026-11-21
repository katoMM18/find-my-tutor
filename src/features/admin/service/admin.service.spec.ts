import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/admin/repository/admin.repository', () => ({
  adminRepository: {
    count: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    averageRating: vi.fn(),
    recentUsers: vi.fn(),
  },
}));

import { adminRepository } from '@/features/admin/repository/admin.repository';
import { hashPassword } from '@/shared/utils/password';

import {
  createAdminDocumentService,
  deleteAdminDocumentService,
  getAdminOverviewService,
  listAdminDocumentsService,
  serializeAdminDocument,
  updateAdminDocumentService,
} from './admin.service';

const repo = vi.mocked(adminRepository);
const ADMIN_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439012';
const objectId = (hex: string) => ({ _bsontype: 'ObjectId', toString: () => hex });

describe('serializeAdminDocument', () => {
  it('turns ids and dates into strings and never exposes secrets', () => {
    const raw = {
      _id: objectId(OTHER_ID),
      name: 'Nino',
      passwordHash: 'secret',
      tokenHash: 'secret',
      createdAt: new Date('2026-01-02T03:04:05.000Z'),
      participants: [objectId(ADMIN_ID)],
    };
    expect(serializeAdminDocument(raw as never)).toEqual({
      _id: OTHER_ID,
      name: 'Nino',
      createdAt: '2026-01-02T03:04:05.000Z',
      participants: [ADMIN_ID],
    });
  });
});

describe('getAdminOverviewService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports totals by role and a count for every collection', async () => {
    repo.count.mockResolvedValue(3);
    repo.averageRating.mockResolvedValueOnce(4.5);
    repo.recentUsers.mockResolvedValueOnce([]);
    const result = await getAdminOverviewService();
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ averageRating: 4.5, collectionCounts: { users: 3, authTokens: 3 } });
    expect(repo.count).toHaveBeenCalledWith('users', { role: 'teacher' });
    expect(repo.count).toHaveBeenCalledWith('users', { role: 'admin' });
  });
});

describe('listAdminDocumentsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('searches the configured fields case-insensitively, with regex characters escaped', async () => {
    repo.list.mockResolvedValueOnce([]);
    repo.count.mockResolvedValueOnce(0);
    await listAdminDocumentsService('users', { page: 2, q: 'a.b' });
    const filter = { $or: [{ name: { $regex: 'a\\.b', $options: 'i' } }, { email: { $regex: 'a\\.b', $options: 'i' } }] };
    expect(repo.list).toHaveBeenCalledWith('users', filter, 20, 20);
  });

  it('matches an exact id', async () => {
    repo.list.mockResolvedValueOnce([]);
    repo.count.mockResolvedValueOnce(0);
    await listAdminDocumentsService('messages', { page: 1, q: OTHER_ID });
    expect(repo.list).toHaveBeenCalledWith('messages', { _id: OTHER_ID }, 0, 20);
  });
});

describe('createAdminDocumentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores a hashed password for a new user, never the password itself', async () => {
    repo.create.mockResolvedValueOnce(OTHER_ID);
    repo.findById.mockResolvedValueOnce({ _id: objectId(OTHER_ID), name: 'Nino' } as never);
    const values = { name: 'Nino', email: 'Nino@Example.com', role: 'teacher', password: 'longenough', emailVerified: true };
    const result = await createAdminDocumentService('users', { values });
    expect(result.status).toBe(201);
    expect(repo.create).toHaveBeenCalledWith('users', {
      name: 'Nino',
      email: 'nino@example.com',
      role: 'teacher',
      emailVerified: true,
      passwordHash: hashPassword('longenough'),
    });
  });

  it('requires a password for a new user', async () => {
    const result = await createAdminDocumentService('users', { values: { name: 'Nino', email: 'n@example.com', role: 'student' } });
    expect(result).toEqual({ data: { error: 'INVALID_FIELD', field: 'password', reason: 'REQUIRED' }, status: 400 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects a value outside the allowed options', async () => {
    const result = await createAdminDocumentService('users', { values: { name: 'N', email: 'n@example.com', role: 'owner', password: 'longenough' } });
    expect(result.data).toEqual({ error: 'INVALID_FIELD', field: 'role', reason: 'INVALID' });
  });

  it('refuses collections that cannot be created from the panel', async () => {
    expect((await createAdminDocumentService('ratings', { values: {} })).status).toBe(405);
  });

  it('turns a duplicate key into a 409', async () => {
    repo.create.mockRejectedValueOnce(Object.assign(new Error('E11000 duplicate key'), { code: 11000 }));
    const result = await createAdminDocumentService('vipPlans', { values: { status: 'vip', productId: 'prod_1' } });
    expect(result.status).toBe(409);
  });
});

describe('updateAdminDocumentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stops an admin from removing their own admin role', async () => {
    repo.findById.mockResolvedValueOnce({ _id: objectId(ADMIN_ID), role: 'admin' } as never);
    const result = await updateAdminDocumentService('users', ADMIN_ID, { values: { role: 'student' } }, ADMIN_ID);
    expect(result).toEqual({ data: { error: 'CANNOT_DEMOTE_SELF' }, status: 403 });
    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('only writes submitted, editable fields and clears emptied optional ones', async () => {
    repo.findById.mockResolvedValueOnce({ _id: objectId(OTHER_ID) } as never);
    repo.updateById.mockResolvedValueOnce({ _id: objectId(OTHER_ID) } as never);
    await updateAdminDocumentService('messages', OTHER_ID, { values: { body: 'Hi', senderId: ADMIN_ID, readAt: '' } }, ADMIN_ID);
    expect(repo.updateById).toHaveBeenCalledWith('messages', OTHER_ID, { body: 'Hi', readAt: null });
  });
});

describe('deleteAdminDocumentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stops an admin from deleting their own account', async () => {
    expect((await deleteAdminDocumentService('users', ADMIN_ID, ADMIN_ID)).status).toBe(403);
    expect(repo.deleteById).not.toHaveBeenCalled();
  });

  it('deletes another record', async () => {
    repo.deleteById.mockResolvedValueOnce(true);
    expect((await deleteAdminDocumentService('users', OTHER_ID, ADMIN_ID)).data).toEqual({ deleted: true });
  });
});
