import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../data';

export default function LocaleLayout({ locale }: { locale: Locale }) {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale, i18n]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        target?.scrollIntoView({ block: 'start' });
        return;
      }
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return <Outlet />;
}
