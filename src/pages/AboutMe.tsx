import { motion } from 'motion/react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { useSiteUrl } from '../hooks/useSiteUrl';
import { useLocale } from '../hooks/useLocale';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { breadcrumbJsonLd } from '../lib/seoSchemas';

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
    <div className="min-h-screen font-sans bg-[#f8f8f7] selection:bg-black selection:text-white">
      <Seo
        title={locale === 'ro' ? 'Despre Laurentiu Pirpiriu' : 'About Laurentiu Pirpiriu'}
        description={t('about.kicker')}
        path={location.pathname}
        jsonLd={breadcrumbJsonLd(siteUrl, [
          { name: t('footer.home'), path: lp('/') },
          { name: t('footer.about'), path: location.pathname },
        ])}
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <Link to={lp('/')} className="font-display font-bold text-xl md:text-2xl tracking-tighter hover:opacity-60 transition-opacity">AURA.</Link>
        <Link to={lp('/')} className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase hover:opacity-60 transition-opacity">
          <ArrowLeft size={16} /> {t('projectDetails.backToWork')}
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-48 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center min-h-[90svh]">
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-6 md:mb-8">
              Laurentiu<br />Pirpiriu
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

            {/* TODO: înlocuiește cu adresa reală de email a lui Laurentiu */}
            <a href="mailto:contact@aura.ro" className="inline-flex items-center gap-2 bg-black text-white px-6 py-4 md:px-8 md:py-4 rounded-full font-medium uppercase tracking-widest text-xs md:text-sm hover:bg-gray-800 transition-colors">
              {t('about.cta')} <Mail size={16} />
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
              alt="Laurentiu Pirpiriu - Cinematographer"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
