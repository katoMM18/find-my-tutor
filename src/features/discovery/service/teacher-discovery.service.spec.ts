import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/discovery/repository/teacher-discovery.repository', () => ({
  teacherDiscoveryRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
  },
}));

import { teacherDiscoveryRepository } from '@/features/discovery/repository/teacher-discovery.repository';

import { getTeacherService, listTeachersService } from './teacher-discovery.service';

const mockRepository = vi.mocked(teacherDiscoveryRepository);

describe('teacher discovery service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a paginated teacher result', async () => {
    mockRepository.findMany.mockResolvedValueOnce({ items: [], total: 0 });
    const filters = { page: 1, limit: 12, subject: 'Math' };

    const result = await listTeachersService(filters);

    expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
    expect(result).toEqual({
      data: { items: [], total: 0, page: 1, limit: 12 },
      status: 200,
    });
  });

  it('returns not found when a public teacher does not exist', async () => {
    mockRepository.findById.mockResolvedValueOnce(null);

    const result = await getTeacherService('missing');

    expect(result).toEqual({ data: { error: 'NOT_FOUND' }, status: 404 });
  });
});
