import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/auth/service/auth.service', () => ({
  registerService: vi.fn(),
}));

vi.mock('@/features/auth/service/email-verification.service', () => ({
  issueVerificationCodeService: vi.fn(),
}));

vi.mock('@/shared/utils/server-i18n', () => ({
  getServerI18n: vi.fn().mockResolvedValue({ locale: 'en' }),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { registerService } from '@/features/auth/service/auth.service';
import { issueVerificationCodeService } from '@/features/auth/service/email-verification.service';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockRegister = vi.mocked(registerService);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 and sends a verification code on success', async () => {
    mockValidate.mockResolvedValueOnce({ data: { fullName: 'Bob', email: 'b@b.com', password: 'pass1234', role: 'student' } } as never);
    mockRegister.mockResolvedValueOnce({ data: { message: 'Account created', id: '507f1f77bcf86cd799439011' }, status: 201 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);
    expect(vi.mocked(issueVerificationCodeService)).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'en');
  });

  it('returns 409 when email is taken', async () => {
    mockValidate.mockResolvedValueOnce({ data: { fullName: 'Bob', email: 'b@b.com', password: 'pass1234', role: 'student' } } as never);
    mockRegister.mockResolvedValueOnce({ data: { error: 'EMAIL_TAKEN' }, status: 409 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(409);
    expect(vi.mocked(issueVerificationCodeService)).not.toHaveBeenCalled();
  });

  it('returns validation error when body is invalid', async () => {
    mockValidate.mockResolvedValueOnce(
      NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
    );
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 500 when service throws', async () => {
    mockValidate.mockResolvedValueOnce({ data: {} } as never);
    mockRegister.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
