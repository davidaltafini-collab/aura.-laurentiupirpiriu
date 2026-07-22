import { useLocale } from './useLocale';
import { withLocale } from '../lib/localePaths';

/**
 * Întoarce o funcție care prefixează o cale (ex: '/about') cu '/ro' dacă
 * limba curentă e româna — folosită la toate <Link>-urile interne, ca
 * navigarea să rămână în aceeași limbă.
 */
export function useLocalizedPath() {
  const locale = useLocale();
  return (path: string) => withLocale(path, locale);
}
