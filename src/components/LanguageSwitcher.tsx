import { useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { withLocale } from '../lib/localePaths';
import type { Locale } from '../data';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const location = useLocation();
  const locale = useLocale();
  const navigate = useNavigate();

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    navigate(withLocale(location.pathname, target) + location.hash);
  };

  return (
    <div className={`flex items-center gap-1.5 font-medium text-xs md:text-sm tracking-wide uppercase ${className}`}>
      <button
        onClick={() => switchTo('ro')}
        className={locale === 'ro' ? 'opacity-100' : 'opacity-50 hover:opacity-100 transition-opacity'}
        aria-current={locale === 'ro'}
      >
        RO
      </button>
      <span className="opacity-30">/</span>
      <button
        onClick={() => switchTo('en')}
        className={locale === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-100 transition-opacity'}
        aria-current={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
