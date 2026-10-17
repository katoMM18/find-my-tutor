import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/discovery/repository/student-discovery.repository', () => ({
  studentDiscoveryRepository: { findMany: vi.fn() },
}));

import { studentDiscoveryRepository } from '@/features/discovery/repository/student-discovery.repository';

import { listStudentsService } from './student-discovery.service';

const mockRepository = vi.mocked(studentDiscoveryRepository);

describe('student discovery service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('only lets teachers browse students', async () => {
    const result = await listStudentsService('student', { page: 1, limit: 12 });

    expect(result).toEqual({ data: { error: 'FORBIDDEN' }, status: 403 });
    expect(mockRepository.findMany).not.toHaveBeenCalled();
  });

  it('returns paginated students for teachers', async () => {
    mockRepository.findMany.mockResolvedValueOnce({ items: [], total: 0 });

    const result = await listStudentsService('teacher', { subject: 'Physics', page: 2, limit: 12 });

    expect(result).toEqual({ data: { items: [], total: 0, page: 2, limit: 12 }, status: 200 });
  });
});
