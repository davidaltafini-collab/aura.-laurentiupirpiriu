import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../data';

export default function LocaleLayout({ locale }: { locale: Locale }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale, i18n]);

  return <Outlet />;
}
