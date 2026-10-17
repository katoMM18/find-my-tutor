export function safeRedirect(target: string | null | undefined, fallback = '/dashboard'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return fallback;
  return target;
}
