import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import Seo from '../components/Seo';
import { useSiteUrl } from '../hooks/useSiteUrl';
import { useLocale } from '../hooks/useLocale';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { breadcrumbJsonLd } from '../lib/seoSchemas';
import BrandLockup from '../components/BrandLockup';
import { scrollToPageTop } from '../lib/scroll';

export default function AboutMe() {
  const { t } = useTranslation();
  const locale = useLocale();
  const siteUrl = useSiteUrl();
  const location = useLocation();
  const lp = useLocalizedPath();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-svh font-sans bg-[#f8f8f7] selection:bg-black selection:text-white">
      <Seo
        title={locale === 'ro' ? 'Despre Laurentiu Pirpiliu' : 'About Laurentiu Pirpiliu'}
        description={t('about.kicker')}
        path={location.pathname}
        jsonLd={breadcrumbJsonLd(siteUrl, [
          { name: t('footer.home'), path: lp('/') },
          { name: t('footer.about'), path: location.pathname },
        ])}
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <Link to={lp('/')} onClick={scrollToPageTop} className="min-w-0 hover:opacity-60 transition-opacity">
          <BrandLockup
            className="max-sm:flex-col max-sm:items-start max-sm:gap-0.5"
            markClassName="text-2xl sm:text-3xl md:text-5xl"
            signatureClassName="text-sm sm:text-xl md:text-3xl"
          />
        </Link>
        <a href={`${lp('/')}#work`} className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase hover:opacity-60 transition-opacity">
          <ArrowLeft size={16} /> {t('projectDetails.backToWork')}
        </a>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-48 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center min-h-[calc(var(--vh,1svh)*90)]">
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-6 md:mb-8">
              Laurentiu<br />Pirpiliu
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-800 leading-relaxed mb-6">
              {t('about.kicker')}
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 md:mb-10 max-w-lg">
              {t('about.bio1')}
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mb-8 md:mb-10">
              {t('about.bio2')}
            </p>

            <a href="#about-contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-4 md:px-8 md:py-4 rounded-full font-medium uppercase tracking-widest text-xs md:text-sm hover:bg-gray-800 transition-colors">
              {t('about.cta')} <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="aspect-[3/4] w-full rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            <img
              src="/laurentiu.png"
              alt="Laurentiu Pirpiliu - Cinematographer"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-20 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto border-y border-black/10 py-8 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
        >
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tighter text-black">
            {t('about.recommendedBy')}
          </h2>
          <img
            src="/recommended-by.webp"
            alt={t('about.recommendedByAlt')}
            className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover shadow-[0_18px_45px_-18px_rgba(0,0,0,0.45)] outline outline-1 outline-offset-[-1px] outline-black/10"
          />
        </motion.div>
      </section>

      <section id="about-contact" className="py-16 md:py-40 px-4 md:px-10">
        <div className="max-w-[95vw] mx-auto bg-black text-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-24 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <img src="/placeholders/wedding-7.webp" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 w-full md:w-3/5">
            <h2 className="font-display text-4xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
              {t('home.contactHeading1')}<br/>{t('home.contactHeading2')}
            </h2>
            <p className="mt-4 md:mt-8 text-base md:text-xl text-gray-400 font-light max-w-md">
              {t('home.contactSubtitle')}
            </p>
          </div>

          <div className="relative z-10 w-full md:w-2/5">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
