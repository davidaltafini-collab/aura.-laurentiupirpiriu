import { useTranslation } from 'react-i18next';
import type { Locale } from '../data';

export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? 'en' : 'ro';
}
