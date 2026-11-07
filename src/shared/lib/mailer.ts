import nodemailer, { type Transporter } from 'nodemailer';

export type MailMessage = {
  to: { email: string; name?: string };
  subject: string;
  text: string;
  html: string;
};

// Sends transactional email over SMTP with Nodemailer. Defaults to Gmail with an app password.
// Without credentials it logs the message instead, so sign-up and password reset keep working in development.
export class Mailer {
  private transporter: Transporter | null = null;

  get configured(): boolean {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const port = Number(process.env.SMTP_PORT ?? 465);
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }
    return this.transporter;
  }

  async send(message: MailMessage): Promise<boolean> {
    if (!this.configured) {
      console.warn(`[mailer] SMTP not configured; would send "${message.subject}" to ${message.to.email}\n${message.text}`);
      return false;
    }

    try {
      await this.getTransporter().sendMail({
        from: { name: process.env.MAIL_FROM_NAME ?? 'Find My Tutor', address: process.env.MAIL_FROM_EMAIL ?? process.env.SMTP_USER ?? '' },
        to: message.to.name ? { name: message.to.name, address: message.to.email } : message.to.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return true;
    } catch (error) {
      console.error('[mailer] SMTP send failed', error);
      return false;
    }
  }
}

export const mailer = new Mailer();
