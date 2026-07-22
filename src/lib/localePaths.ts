import type { Locale } from '../data';

export function stripLocalePrefix(path: string): string {
  if (path === '/en' || path.startsWith('/en/')) {
    const rest = path.slice(3);
    return rest || '/';
  }
  if (path === '/ro' || path.startsWith('/ro/')) {
    const rest = path.slice(3);
    return rest || '/';
  }
  return path;
}

export function withLocale(path: string, locale: Locale): string {
  const base = stripLocalePrefix(path);
  if (locale === 'en') return base;
  return base === '/' ? '/ro' : `/ro${base}`;
}
