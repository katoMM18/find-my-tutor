import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendMail = vi.hoisted(() => vi.fn());
const createTransport = vi.hoisted(() => vi.fn(() => ({ sendMail })));

vi.mock('nodemailer', () => ({ default: { createTransport } }));

import { Mailer } from './mailer';

const message = { to: { email: 'ana@example.com', name: 'Ana' }, subject: 'Hi', text: 'Hello', html: '<p>Hello</p>' };

describe('Mailer', () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('logs instead of sending when SMTP is not configured', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    expect(await new Mailer().send(message)).toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('sends through Gmail SMTP by default', async () => {
    process.env.SMTP_USER = 'hello@gmail.com';
    process.env.SMTP_PASS = 'app-password';
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.MAIL_FROM_EMAIL;
    sendMail.mockResolvedValueOnce({});

    expect(await new Mailer().send(message)).toBe(true);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: 'hello@gmail.com', pass: 'app-password' } })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: { name: 'Ana', address: 'ana@example.com' }, from: { name: 'Find My Tutor', address: 'hello@gmail.com' } })
    );
  });

  it('returns false when SMTP rejects the message', async () => {
    process.env.SMTP_USER = 'hello@gmail.com';
    process.env.SMTP_PASS = 'wrong';
    sendMail.mockRejectedValueOnce(new Error('Invalid login'));
    expect(await new Mailer().send(message)).toBe(false);
  });
});
