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
    navigate(withLocale(location.pathname, target) + location.search + location.hash);
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-white/80 p-1 font-medium text-xs md:text-sm tracking-wide uppercase shadow-sm ring-1 ring-black/10 backdrop-blur-md ${className}`}>
      <button
        onClick={() => switchTo('en')}
        className={`min-h-8 rounded-full px-3 transition-colors ${locale === 'en' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
        aria-current={locale === 'en'}
      >
        EN
      </button>
      <span className="opacity-30">/</span>
      <button
        onClick={() => switchTo('ro')}
        className={`min-h-8 rounded-full px-3 transition-colors ${locale === 'ro' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
        aria-current={locale === 'ro'}
      >
        RO
      </button>
    </div>
  );
}
