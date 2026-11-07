import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/requests/repository/student-request.repository', () => ({
  studentRequestRepository: {
    create: vi.fn(),
    countOpenByStudent: vi.fn(),
    findByStudent: vi.fn(),
    findOpenForSubjects: vi.fn(),
    findById: vi.fn(),
    close: vi.fn(),
    addReply: vi.fn(),
  },
}));
vi.mock('@/features/profiles/repository/profile.repository', () => ({ profileRepository: { findTeacherByUserId: vi.fn() } }));
vi.mock('@/features/auth/repository/user.repository', () => ({ userRepository: { findById: vi.fn() } }));
vi.mock('@/features/chat/service/chat.service', () => ({ createConversationService: vi.fn(), sendMessageService: vi.fn() }));

import { userRepository } from '@/features/auth/repository/user.repository';
import { createConversationService, sendMessageService } from '@/features/chat/service/chat.service';
import { profileRepository } from '@/features/profiles/repository/profile.repository';
import { studentRequestRepository } from '@/features/requests/repository/student-request.repository';

import { createRequestService, listRequestsService, replyToRequestService } from './student-request.service';

const repo = vi.mocked(studentRequestRepository);
const STUDENT = '507f1f77bcf86cd799439011';
const TUTOR = '507f1f77bcf86cd799439012';
const input = { subject: 'Mathematics', goal: 'national_exams' as const, note: '' };

describe('student requests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('only students can post, and only a few open at a time', async () => {
    expect((await createRequestService(TUTOR, 'teacher', input)).status).toBe(403);
    repo.countOpenByStudent.mockResolvedValueOnce(3);
    expect((await createRequestService(STUDENT, 'student', input)).status).toBe(409);
  });

  it('shows tutors open requests for the subjects they teach, including second languages', async () => {
    vi.mocked(profileRepository.findTeacherByUserId).mockResolvedValueOnce({ subjects: ['Mathematics', 'SecondLanguage:German'] } as never);
    repo.findOpenForSubjects.mockResolvedValueOnce([]);
    await listRequestsService(TUTOR, 'teacher');
    expect(repo.findOpenForSubjects).toHaveBeenCalledWith(['Mathematics', 'SecondLanguage:German', 'SecondLanguage'], 30);
  });

  it('a tutor reply opens a conversation, sends a first message and is counted', async () => {
    repo.findById.mockResolvedValueOnce({ status: 'open', studentId: { toString: () => STUDENT }, subject: 'Mathematics' } as never);
    vi.mocked(createConversationService).mockResolvedValueOnce({ data: { id: 'conv_1' }, status: 201 } as never);
    vi.mocked(userRepository.findById).mockResolvedValueOnce({ name: 'Ana Beridze' } as never);

    const result = await replyToRequestService(TUTOR, 'teacher', 'req_1', 'en');
    expect(result.data).toEqual({ conversationId: 'conv_1' });
    expect(vi.mocked(sendMessageService).mock.calls[0][2].body).toContain('Ana');
    expect(repo.addReply).toHaveBeenCalledWith('req_1', TUTOR);
  });
});
