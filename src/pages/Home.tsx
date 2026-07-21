import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useLocale } from '../hooks/useLocale';
import { useSiteUrl } from '../hooks/useSiteUrl';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { projectTitle } from '../data';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import Seo from '../components/Seo';
import FaqSection from '../components/FaqSection';
import AreasServedSection from '../components/AreasServedSection';
import { photographyBusinessJsonLd, faqJsonLd, BUSINESS } from '../lib/seoSchemas';
import { HOME_FAQ, faqQuestion, faqAnswer } from '../data/faq';

export default function Home() {
  const { projects } = useProjects();
  const locale = useLocale();
  const { t } = useTranslation();
  const siteUrl = useSiteUrl();
  const location = useLocation();
  const lp = useLocalizedPath();
  const featuredProjects = projects.filter(p => p.featured);

  // Pornește de la scale-105, scara pe care o avea deja poza în repaus.
  const { ref: heroRef, scale: heroScale, y: heroY } = useHeroParallax(1.05, 0.32, 0.12);

  return (
    <div className="min-h-svh font-sans selection:bg-black selection:text-white">
      <Seo
        title="Aura — Wedding & Drone Cinematography"
        description={locale === 'ro' ? BUSINESS.descriptionRo : BUSINESS.descriptionEn}
        path={location.pathname}
        jsonLd={[
          photographyBusinessJsonLd(siteUrl),
          faqJsonLd(HOME_FAQ.map(item => ({ question: faqQuestion(item, locale), answer: faqAnswer(item, locale) }))),
        ]}
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <Link to={lp('/')} className="font-display font-bold text-4xl md:text-5xl tracking-tighter">AURA.</Link>
        <div className="hidden md:flex gap-8 font-medium text-sm tracking-wide uppercase">
          <a href="#about" className="hover:opacity-60 transition-opacity">{t('nav.about')}</a>
          <a href="#work" className="hover:opacity-60 transition-opacity">{t('nav.work')}</a>
          <a href="#contact" className="hover:opacity-60 transition-opacity">{t('nav.contact')}</a>
        </div>
        <a href="#contact" className="bg-white text-black px-7 py-4 md:px-10 md:py-5 rounded-full font-semibold text-base md:text-lg tracking-wide uppercase hover:scale-105 transition-transform duration-300">
          {t('nav.bookNow')}
        </a>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="h-[calc(var(--vh,1svh)*95)] w-[95vw] mx-auto mt-[calc(var(--vh,1svh)*2.5)] relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gray-200 shadow-2xl">
        <motion.img
          src="/placeholders/wedding-2.jpg"
          alt="Wedding couple"
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-12 md:pb-20 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[15vw] sm:text-6xl md:text-8xl lg:text-[10vw] font-bold leading-[0.85] tracking-tighter uppercase"
          >
            {t('home.heroTitle1')}<br />{t('home.heroTitle2')}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-4 md:mt-10 flex items-center gap-4 text-base md:text-xl font-light"
          >
            <p className="max-w-[280px] md:max-w-md text-gray-200">{t('home.heroSubtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* About/Vibe Section */}
      <section id="about" className="py-24 md:py-40 px-6 md:px-12 max-w-[100vw] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center">
          <div className="w-full md:w-1/2">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance leading-tight"
            >
              {t('home.aboutHeading')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed"
            >
              {t('home.aboutBody')}
            </motion.p>
          </div>
          <div className="w-full md:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="aspect-[4/5] w-full rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative"
            >
              <img
                src="/placeholders/wedding-4.jpg"
                alt="Photographer"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 md:-bottom-10 md:-left-20 aspect-square w-40 md:w-64 rounded-full overflow-hidden shadow-2xl border-4 border-[#f8f8f7]"
            >
              <img
                src="/placeholders/wedding-4.jpg"
                alt="Drone detail"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio/Work Section */}
      <section id="work" className="py-24 px-4 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 px-2 gap-4">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase">{t('home.workHeading1')}<br/>{t('home.workHeading2')}</h2>
          <Link to={lp('/archive')} className="flex items-center gap-2 font-medium text-sm md:text-lg hover:opacity-60 transition-opacity uppercase tracking-widest md:normal-case md:tracking-normal">
            {t('home.viewArchive')} <ArrowRight size={16} className="md:w-5 md:h-5" />
          </Link>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {featuredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i % 3 * 0.1 }}
              className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] break-inside-avoid shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] transition-shadow duration-500"
            >
              <img
                src={project.coverImage}
                alt={projectTitle(project, locale)}
                loading="lazy"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <Link to={lp(`/project/${project.id}`)} className="bg-white/90 backdrop-blur-sm text-black px-8 py-3 rounded-full font-medium text-sm tracking-wider uppercase inline-block">
                    {t('home.viewProject')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AreasServedSection />

      <FaqSection items={HOME_FAQ} />

      {/* Contact CTA */}
      <section id="contact" className="py-16 md:py-40 px-4 md:px-10">
        <div className="max-w-[95vw] mx-auto bg-black text-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-24 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16">

          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <img src="/placeholders/wedding-7.jpg" alt="texture" className="w-full h-full object-cover" />
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
