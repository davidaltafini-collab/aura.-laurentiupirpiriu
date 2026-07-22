import { lazy, Suspense, useState } from 'react';
import { Mail, MapPin, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { scrollToPageTop } from '../lib/scroll';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLockup from './BrandLockup';

const PhotoSubmissionModal = lazy(() => import('./PhotoSubmissionModal'));

function preloadPhotoSubmissionModal() {
  void import('./PhotoSubmissionModal');
}

export default function Footer() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();

  const [modalRequested, setModalRequested] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    preloadPhotoSubmissionModal();
    setModalRequested(true);
    setModalOpen(true);
  };

  return (
    <>
      <footer className="py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 mt-auto bg-[#f8f8f7]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to={lp('/')} onClick={scrollToPageTop} className="hover:opacity-70 transition-opacity">
            <BrandLockup markClassName="text-2xl" signatureClassName="text-lg" />
          </Link>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium text-xs md:text-sm tracking-wide uppercase text-gray-500">
            <Link to={lp('/')} onClick={scrollToPageTop} className="hover:text-black transition-colors">{t('footer.home')}</Link>
            <Link to={lp('/about')} className="hover:text-black transition-colors">{t('footer.about')}</Link>
            <Link to={lp('/archive')} className="hover:text-black transition-colors">{t('footer.archive')}</Link>
            <a href={`${lp('/')}#contact`} className="hover:text-black transition-colors">{t('footer.contact')}</a>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-500">
          <button
            onClick={openModal}
            onFocus={preloadPhotoSubmissionModal}
            onMouseEnter={preloadPhotoSubmissionModal}
            title={t('photoModal.trigger')}
            aria-label={t('photoModal.trigger')}
            className="hover:text-black transition-colors"
          >
            <Camera size={20} />
          </button>
          <a href="mailto:contact@captur.ro" title="Email" aria-label="Email" className="hover:text-black transition-colors"><Mail size={20} /></a>
          <a href="https://www.google.com/maps/search/?api=1&query=CAPTUR.%20Laurentiu%20Pirpiliu%20Romania" target="_blank" rel="noopener noreferrer" title="Location" aria-label="Location" className="hover:text-black transition-colors"><MapPin size={20} /></a>
          <LanguageSwitcher className="text-gray-500" />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-xs md:text-sm text-gray-400 uppercase tracking-wider text-center">
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <Link to="/login" className="hover:text-black transition-colors">{t('footer.admin')}</Link>
        </div>
      </footer>

      {modalRequested && (
        <Suspense fallback={null}>
          <PhotoSubmissionModal
            open={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            onExited={() => setModalRequested(false)}
          />
        </Suspense>
      )}
    </>
  );
}
