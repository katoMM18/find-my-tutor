import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/discovery/repository/teacher-discovery.repository', () => ({
  teacherDiscoveryRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findListedPrices: vi.fn(),
    countBySubject: vi.fn(),
  },
}));

import { teacherDiscoveryRepository } from '@/features/discovery/repository/teacher-discovery.repository';
import { PublicTeacher, TeacherRow } from '@/features/discovery/types/teacher-discovery.types';
import { MatchType } from '@/features/discovery/validations/match.validation';

import {
  getPriceGuideService,
  getTeacherService,
  listTeachersService,
  matchTutorsService,
  scoreTutor,
  subjectCountsService,
} from './teacher-discovery.service';

const teacher = (overrides: Partial<PublicTeacher> = {}): PublicTeacher => ({
  id: 'teacher-1',
  userId: 'user-1',
  name: 'Nino Beridze',
  headline: '',
  bio: 'Maths tutor',
  subjects: ['Mathematics'],
  experienceYears: 5,
  education: '',
  qualifications: '',
  rating: null,
  reviewCount: 0,
  availableDays: [1, 3],
  timezone: null,
  vipStatus: 'none',
  pricePerLesson: 40,
  lessonFormats: ['online'],
  areas: [],
  acceptingStudents: true,
  verified: false,
  responseMinutes: null,
  freeIntro: false,
  nextFree: null,
  ...overrides,
});

const row = (overrides: Partial<PublicTeacher> = {}): TeacherRow => {
  const rest: Omit<PublicTeacher, 'nextFree'> & { nextFree?: PublicTeacher['nextFree'] } = teacher(overrides);
  delete rest.nextFree;
  return { ...rest, weekly: [] };
};

const answers = (overrides: Partial<MatchType> = {}): MatchType => ({
  subject: 'Mathematics',
  goal: 'school',
  budget: 50,
  format: null,
  area: null,
  days: [],
  ...overrides,
});

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

  describe('price guide', () => {
    it('uses the area median when enough tutors cover the area', async () => {
      mockRepository.findListedPrices.mockResolvedValueOnce([30, 50, 40]);

      const result = await getPriceGuideService({ subject: 'Mathematics', area: 'vake' });

      expect(mockRepository.findListedPrices).toHaveBeenCalledWith('Mathematics', 'vake');
      expect(result).toEqual({ data: { median: 40, count: 3, scope: 'area' }, status: 200 });
    });

    it('falls back to every listed tutor when the area is thin', async () => {
      mockRepository.findListedPrices.mockResolvedValueOnce([30]).mockResolvedValueOnce([20, 30, 40, 50]);

      const result = await getPriceGuideService({ subject: 'Mathematics', area: 'vake' });

      expect(result).toEqual({ data: { median: 35, count: 4, scope: 'all' }, status: 200 });
    });

    it('withholds a median until enough tutors are listed', async () => {
      mockRepository.findListedPrices.mockResolvedValueOnce([30, 60]);

      const result = await getPriceGuideService({ subject: 'Mathematics' });

      expect(result).toEqual({ data: { median: null, count: 2, scope: 'all' }, status: 200 });
    });
  });

  describe('tutor matching', () => {
    it('explains shared days, budget and quick replies', () => {
      const match = scoreTutor(teacher({ responseMinutes: 30 }), answers({ days: [1, 2] }));

      expect(match.reasons).toEqual([
        { kind: 'days', days: [1] },
        { kind: 'budget', difference: 10 },
        { kind: 'fastReply', minutes: 30 },
      ]);
    });

    it('ranks a tutor free on your days above one who is not', () => {
      const free = scoreTutor(teacher({ id: 'free', availableDays: [2] }), answers({ days: [2] }));
      const busy = scoreTutor(teacher({ id: 'busy', availableDays: [5] }), answers({ days: [2] }));

      expect(free.score).toBeGreaterThan(busy.score);
    });

    it('stretches the budget, skips tutors not taking students and returns the top three', async () => {
      mockRepository.findMany.mockResolvedValueOnce({
        items: [
          row({ id: 'a', pricePerLesson: 58 }),
          row({ id: 'b', pricePerLesson: 30, verified: true }),
          row({ id: 'c', acceptingStudents: false }),
          row({ id: 'd', pricePerLesson: 45 }),
          row({ id: 'e', pricePerLesson: 40 }),
        ],
        total: 5,
      });

      const result = await matchTutorsService(answers({ format: 'online', area: 'vake' }));

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Mathematics', format: 'online', area: undefined, maxPrice: 60, limit: 24 })
      );
      expect(result.status).toBe(200);
      expect(result.data).toMatchObject({ considered: 5 });
      expect('matches' in result.data && result.data.matches.map((match) => match.teacher.id)).toEqual(['b', 'e', 'd']);
    });
  });

  it('turns weekly hours into the next free slot and drops them from the public card', async () => {
    mockRepository.findMany.mockResolvedValueOnce({
      items: [{ ...row(), timezone: 'Asia/Tbilisi', weekly: [{ day: 1, intervals: [{ start: '10:00', end: '11:00' }] }] }],
      total: 1,
    });

    const result = await listTeachersService({ page: 1, limit: 12 });

    const [card] = 'items' in result.data ? result.data.items : [];
    expect(card).not.toHaveProperty('weekly');
    expect(card.nextFree).toMatchObject({ day: 1, start: '10:00' });
  });

  it('counts tutors per subject and folds second languages together', async () => {
    mockRepository.countBySubject.mockResolvedValueOnce([
      { subject: 'Mathematics', count: 4 },
      { subject: 'SecondLanguage:German', count: 2 },
      { subject: 'SecondLanguage:French', count: 1 },
    ]);

    const result = await subjectCountsService();

    expect(result).toEqual({ data: { Mathematics: 4, SecondLanguage: 3 }, status: 200 });
  });
});
