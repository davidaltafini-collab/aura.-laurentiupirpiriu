import { useLocale } from './useLocale';
import { withLocale } from '../lib/localePaths';

/**
 * Întoarce o funcție care prefixează o cale (ex: '/about') cu '/en' dacă
 * limba curentă e engleza — folosită la toate <Link>-urile interne, ca
 * navigarea să rămână în aceeași limbă.
 */
export function useLocalizedPath() {
  const locale = useLocale();
  return (path: string) => withLocale(path, locale);
}
