import { type Locale } from '@/shared/const/i18n.const';
import { i18n } from '@/shared/lib/i18n';
import { mailer } from '@/shared/lib/mailer';

type Recipient = { email: string; name: string };

type EmailContent = {
  heading: string;
  body: string;
  code?: string;
  action?: { label: string; url: string };
  note?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const appUrl = (path = '') => `${(process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')}${path}`;

const renderButton = (action: { label: string; url: string }) =>
  `<p style="margin:0 0 20px"><a href="${escapeHtml(action.url)}" ` +
  'style="display:inline-block;background:#27477d;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">' +
  `${escapeHtml(action.label)}</a></p>`;

// Email clients ignore stylesheets, so this one layout carries its styling inline (the only place the app does so).
const renderHtml = (content: EmailContent, footer: string) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#e4edf3;font-family:Arial,Helvetica,sans-serif;color:#1a1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td>
<h1 style="margin:0 0 12px;font-size:24px">${escapeHtml(content.heading)}</h1>
<p style="margin:0 0 20px;font-size:16px;line-height:1.5">${escapeHtml(content.body)}</p>
${content.code ? `<p style="margin:0 0 20px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#27477d">${content.code}</p>` : ''}
${content.action ? renderButton(content.action) : ''}
${content.note ? `<p style="margin:0 0 20px;font-size:13px;color:#55606a">${escapeHtml(content.note)}</p>` : ''}
<p style="margin:24px 0 0;font-size:12px;color:#55606a">${escapeHtml(footer)}</p>
</td></tr></table>
</td></tr></table>
</body></html>`;

const renderText = (content: EmailContent, footer: string) =>
  [content.heading, '', content.body, content.code, content.action && `${content.action.label}: ${content.action.url}`, content.note, '', footer]
    .filter((line) => line !== undefined)
    .join('\n');

const send = (to: Recipient, subject: string, content: EmailContent, locale: Locale) => {
  const footer = i18n.dictionary(locale).emails.footer;
  return mailer.send({ to, subject, text: renderText(content, footer), html: renderHtml(content, footer) });
};

export async function sendVerificationCodeEmail(to: Recipient, code: string, locale: Locale): Promise<boolean> {
  const t = i18n.dictionary(locale).emails;
  return send(to, i18n.format(t.verifySubject, { code }), {
    heading: t.verifyHeading,
    body: i18n.format(t.verifyBody, { name: to.name }),
    code,
    note: t.verifyIgnore,
  }, locale);
}

export async function sendWelcomeEmail(to: Recipient, role: 'teacher' | 'student', locale: Locale): Promise<boolean> {
  const t = i18n.dictionary(locale).emails;
  return send(to, i18n.format(t.welcomeSubject, { name: to.name }), {
    heading: t.welcomeHeading,
    body: role === 'teacher' ? t.welcomeBodyTeacher : t.welcomeBodyStudent,
    action: { label: t.welcomeAction, url: appUrl(role === 'teacher' ? '/profile' : '/teachers') },
  }, locale);
}

export async function sendPasswordResetEmail(to: Recipient, resetUrl: string, locale: Locale): Promise<boolean> {
  const t = i18n.dictionary(locale).emails;
  return send(to, t.resetSubject, {
    heading: t.resetHeading,
    body: i18n.format(t.resetBody, { name: to.name }),
    action: { label: t.resetAction, url: resetUrl },
    note: t.resetIgnore,
  }, locale);
}
