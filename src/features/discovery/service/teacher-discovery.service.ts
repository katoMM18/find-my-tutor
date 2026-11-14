import { teacherDiscoveryRepository } from '@/features/discovery/repository/teacher-discovery.repository';
import {
  MatchReason,
  PriceGuide,
  PublicTeacher,
  TeacherDiscoveryFilters,
  TeacherDiscoveryResult,
  TeacherRow,
  TutorMatch,
  TutorMatchResult,
} from '@/features/discovery/types/teacher-discovery.types';
import { MatchType, PriceGuideQueryType } from '@/features/discovery/validations/match.validation';
import {
  MATCH_BUDGET_STRETCH,
  MATCH_CANDIDATE_LIMIT,
  MATCH_FAST_REPLY_MINUTES,
  MATCH_RESULT_COUNT,
  PRICE_GUIDE_MIN_SAMPLES,
} from '@/shared/const/listing.const';
import { SECOND_LANGUAGE_SUBJECT } from '@/shared/const/subjects.const';
import { ServiceResult } from '@/shared/types/common';
import { nextFreeSlot } from '@/shared/utils/availability';
import { secondLanguageOf, subjectFilterValue } from '@/shared/utils/subjects';

// Weekly hours stay server-side; the card only needs the next opening.
export function toPublicTeacher({ weekly, ...teacher }: TeacherRow, now: Date = new Date()): PublicTeacher {
  return { ...teacher, nextFree: nextFreeSlot(weekly, teacher.timezone, now) };
}

export async function listTeachersService(
  filters: TeacherDiscoveryFilters
): Promise<ServiceResult<TeacherDiscoveryResult>> {
  const subject = typeof filters.subject === 'string' ? subjectFilterValue(filters.subject) : filters.subject;
  const result = await teacherDiscoveryRepository.findMany({ ...filters, subject });
  const now = new Date();
  return {
    data: { items: result.items.map((row) => toPublicTeacher(row, now)), total: result.total, page: filters.page, limit: filters.limit },
    status: 200,
  };
}

export async function getTeacherService(
  id: string
): Promise<ServiceResult<PublicTeacher>> {
  const teacher = await teacherDiscoveryRepository.findById(id);
  if (!teacher) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: toPublicTeacher(teacher), status: 200 };
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

export async function getPriceGuideService(
  query: PriceGuideQueryType
): Promise<ServiceResult<PriceGuide>> {
  const subject = subjectFilterValue(query.subject);

  if (query.area) {
    const local = await teacherDiscoveryRepository.findListedPrices(subject, query.area);
    if (local.length >= PRICE_GUIDE_MIN_SAMPLES) {
      return { data: { median: median(local), count: local.length, scope: 'area' }, status: 200 };
    }
  }

  const prices = await teacherDiscoveryRepository.findListedPrices(subject);
  return {
    data: {
      median: prices.length >= PRICE_GUIDE_MIN_SAMPLES ? median(prices) : null,
      count: prices.length,
      scope: 'all',
    },
    status: 200,
  };
}

// Scores one tutor against the answers. Higher is better; reasons explain the score in the order shown.
export function scoreTutor(teacher: PublicTeacher, answers: MatchType): TutorMatch {
  const reasons: MatchReason[] = [];
  let score = 0;

  if (answers.days.length > 0) {
    const shared = answers.days.filter((day) => teacher.availableDays.includes(day));
    score += shared.length > 0 ? 2 * shared.length : -3;
    if (shared.length > 0) reasons.push({ kind: 'days', days: shared });
  }

  if (answers.budget !== null && teacher.pricePerLesson !== null) {
    const difference = answers.budget - teacher.pricePerLesson;
    score += difference >= 0 ? 3 + Math.min(difference, 20) / 10 : -1;
    reasons.push({ kind: 'budget', difference });
  }

  if (answers.format !== 'online' && answers.area && teacher.areas.includes(answers.area)) {
    score += 2;
    reasons.push({ kind: 'nearby', area: answers.area });
  }

  // Free within a day: the student can start this week, not next month.
  if (teacher.nextFree && teacher.nextFree.inDays <= 1) {
    score += 1;
    reasons.push({ kind: 'soon', slot: teacher.nextFree });
  }

  if (teacher.freeIntro) {
    score += 1;
    reasons.push({ kind: 'freeIntro' });
  }

  if (teacher.responseMinutes !== null && teacher.responseMinutes <= MATCH_FAST_REPLY_MINUTES) {
    score += 1.5;
    reasons.push({ kind: 'fastReply', minutes: teacher.responseMinutes });
  }

  if (teacher.rating !== null && teacher.reviewCount > 0) {
    // A 5.0 from one review counts for less than a 4.8 from ten.
    score += ((teacher.rating - 3) * Math.min(teacher.reviewCount, 5)) / 5 * 2;
    if (teacher.rating >= 4) reasons.push({ kind: 'rated', rating: teacher.rating, count: teacher.reviewCount });
  }

  if (teacher.verified) {
    score += 1;
    reasons.push({ kind: 'verified' });
  }

  return { teacher, score: Math.round(score * 100) / 100, reasons };
}

export async function matchTutorsService(
  answers: MatchType
): Promise<ServiceResult<TutorMatchResult>> {
  const inPerson = answers.format !== null && answers.format !== 'online';
  const { items } = await teacherDiscoveryRepository.findMany({
    subject: subjectFilterValue(answers.subject),
    format: answers.format ?? undefined,
    area: inPerson && answers.area ? answers.area : undefined,
    maxPrice: answers.budget !== null ? Math.round(answers.budget * MATCH_BUDGET_STRETCH) : undefined,
    sort: 'recommended',
    page: 1,
    limit: MATCH_CANDIDATE_LIMIT,
  });

  const now = new Date();
  const matches = items
    .map((row) => toPublicTeacher(row, now))
    .filter((teacher) => teacher.acceptingStudents)
    .map((teacher) => scoreTutor(teacher, answers))
    .sort((a, b) => b.score - a.score)
    .slice(0, MATCH_RESULT_COUNT);

  return { data: { matches, considered: items.length }, status: 200 };
}

// Tutors per subject; every "SecondLanguage:<language>" counts toward the second-language subject.
export async function subjectCountsService(): Promise<ServiceResult<Record<string, number>>> {
  const rows = await teacherDiscoveryRepository.countBySubject();
  const counts: Record<string, number> = {};
  rows.forEach(({ subject, count }) => {
    const key = secondLanguageOf(subject) ? SECOND_LANGUAGE_SUBJECT : subject;
    counts[key] = (counts[key] ?? 0) + count;
  });
  return { data: counts, status: 200 };
}
