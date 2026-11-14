import { APP_BACKGROUND_COLOR, APP_NAME, APP_SHORT_NAME, APP_THEME_COLOR } from '@/shared/const/app.const';
import { getServerI18n } from '@/shared/utils/server-i18n';

import type { MetadataRoute } from 'next';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { t } = await getServerI18n();

  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: t.meta.description,
    start_url: '/',
    display: 'standalone',
    background_color: APP_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: t.match.shortcut, url: '/match' },
      { name: t.shortlist.title, url: '/saved' },
      { name: t.nav.messages, url: '/messages' },
    ],
  };
}
