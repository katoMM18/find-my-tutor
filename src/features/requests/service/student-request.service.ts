import { userRepository } from '@/features/auth/repository/user.repository';
import { createConversationService, sendMessageService } from '@/features/chat/service/chat.service';
import { profileRepository } from '@/features/profiles/repository/profile.repository';
import { studentRequestRepository } from '@/features/requests/repository/student-request.repository';
import { StudentRequestDocument } from '@/features/requests/schema/student-request.schema';
import { PublicRequest, TutorRequest } from '@/features/requests/types/request.types';
import { CreateRequestType } from '@/features/requests/validations/request.validation';
import { type Locale } from '@/shared/const/i18n.const';
import { MAX_OPEN_REQUESTS } from '@/shared/const/requests.const';
import { SECOND_LANGUAGE_SUBJECT } from '@/shared/const/subjects.const';
import { i18n } from '@/shared/lib/i18n';
import { ServiceResult } from '@/shared/types/common';
import { secondLanguageOf } from '@/shared/utils/subjects';

type Role = 'teacher' | 'student';

const TUTOR_FEED_LIMIT = 30;

const toPublicRequest = (request: StudentRequestDocument): PublicRequest => ({
  id: request._id.toString(),
  subject: request.subject,
  goal: request.goal,
  format: request.format ?? null,
  area: request.area ?? null,
  budget: request.budget ?? null,
  note: request.note ?? '',
  status: request.status,
  createdAt: request.createdAt.toISOString(),
  replyCount: request.repliedTeacherIds.length,
});

export async function createRequestService(userId: string, role: Role, input: CreateRequestType): Promise<ServiceResult<PublicRequest>> {
  if (role !== 'student') return { data: { error: 'FORBIDDEN' }, status: 403 };
  if ((await studentRequestRepository.countOpenByStudent(userId)) >= MAX_OPEN_REQUESTS) {
    return { data: { error: 'TOO_MANY_OPEN' }, status: 409 };
  }
  const request = await studentRequestRepository.create(userId, input);
  return { data: toPublicRequest(request), status: 201 };
}

// Students see their own requests; tutors see open requests for the subjects they teach.
export async function listRequestsService(userId: string, role: Role): Promise<ServiceResult<PublicRequest[] | TutorRequest[]>> {
  if (role === 'student') {
    const mine = await studentRequestRepository.findByStudent(userId);
    return { data: mine.map(toPublicRequest), status: 200 };
  }

  const profile = await profileRepository.findTeacherByUserId(userId);
  const taught = profile?.subjects ?? [];
  const subjects = taught.some((subject) => secondLanguageOf(subject)) ? [...taught, SECOND_LANGUAGE_SUBJECT] : taught;
  if (subjects.length === 0) return { data: [], status: 200 };

  const requests = await studentRequestRepository.findOpenForSubjects(subjects, TUTOR_FEED_LIMIT);
  const students = await Promise.all(requests.map((request) => userRepository.findById(request.studentId.toString())));
  const data: TutorRequest[] = requests.map((request, index) => ({
    ...toPublicRequest(request),
    studentName: students[index]?.name ?? '',
    studentAvatar: students[index]?.avatar ?? null,
    replied: request.repliedTeacherIds.some((id) => id.toString() === userId),
  }));
  return { data, status: 200 };
}

export async function closeRequestService(userId: string, requestId: string): Promise<ServiceResult<{ closed: true }>> {
  const closed = await studentRequestRepository.close(requestId, userId);
  if (!closed) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { closed: true }, status: 200 };
}

// A tutor's reply opens (or reuses) the conversation with the student and sends a short first message.
export async function replyToRequestService(
  userId: string,
  role: Role,
  requestId: string,
  locale: Locale
): Promise<ServiceResult<{ conversationId: string }>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const request = await studentRequestRepository.findById(requestId);
  if (!request || request.status !== 'open') return { data: { error: 'NOT_FOUND' }, status: 404 };

  const studentId = request.studentId.toString();
  const conversation = await createConversationService(userId, { participantId: studentId });
  if (!('id' in conversation.data)) return { data: conversation.data, status: conversation.status };

  const student = await userRepository.findById(studentId);
  const t = i18n.dictionary(locale);
  const language = secondLanguageOf(request.subject);
  const subjectName = language
    ? `${t.subjects.SecondLanguage} (${t.languages[language] ?? language})`
    : t.subjects[request.subject] ?? request.subject;
  await sendMessageService(userId, conversation.data.id, {
    body: i18n.format(t.requests.replyTemplate, { name: student?.name.split(' ')[0] ?? '', subject: subjectName }),
  });
  await studentRequestRepository.addReply(requestId, userId);

  return { data: { conversationId: conversation.data.id }, status: 200 };
}
