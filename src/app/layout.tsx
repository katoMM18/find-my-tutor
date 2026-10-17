import { Geist_Mono, Inter, Noto_Sans_Georgian, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';

import { APP_NAME } from '@/shared/const/app.const';
import { I18nProvider } from '@/shared/providers/i18n-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { getServerI18n } from '@/shared/utils/server-i18n';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: '--font-georgian',
  subsets: ['georgian'],
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: APP_NAME, description: t.meta.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale } = await getServerI18n();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansGeorgian.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
