import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, MapPin, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useLocale } from '../hooks/useLocale';
import { useSiteUrl } from '../hooks/useSiteUrl';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { useHeroParallax } from '../hooks/useHeroParallax';
import { projectTitle, projectDescription } from '../data';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { breadcrumbJsonLd, projectJsonLd } from '../lib/seoSchemas';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { projects, loading } = useProjects();
  const locale = useLocale();
  const { t } = useTranslation();
  const siteUrl = useSiteUrl();
  const lp = useLocalizedPath();
  const project = projects.find(p => p.id === id);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fromArchive = location.state?.from === 'archive';
  const backLink = fromArchive ? lp('/archive') : lp('/');
  const backText = fromArchive ? t('projectDetails.backToArchive') : t('projectDetails.backToWork');

  // Scroll to top on load. Dependența pe `id` e esențială: la „proiectul următor"
  // ruta e aceeași (/project/:id), doar parametrul se schimbă, deci React Router
  // NU remontează componenta. Cu [] efectul rula o singură dată și rămâneai jos
  // în pagină, exact unde erai când ai dat click.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Pornește de la scale(1), scara pe care o avea deja poza în repaus.
  // Hook-ul stă înaintea return-urilor timpurii de mai jos (regula hooks).
  const { ref: heroRef, scale: heroScale, y: heroY } = useHeroParallax(1, 0.36, 0.15);

  if (loading) {
    return <div className="min-h-svh" />;
  }

  if (!project) {
    return (
      <div className="min-h-svh flex items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">{t('projectDetails.notFoundTitle')}</h1>
          <Link to={lp('/')} className="text-gray-500 hover:text-black transition-colors underline">{t('projectDetails.notFoundCta')}</Link>
        </div>
      </div>
    );
  }

  // Find next project
  const currentIndex = projects.findIndex(p => p.id === id);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <div className="min-h-svh font-sans selection:bg-black selection:text-white bg-[#f8f8f7]">
      <Seo
        title={projectTitle(project, locale)}
        description={projectDescription(project, locale)}
        path={location.pathname}
        image={project.coverImage}
        type="article"
        jsonLd={[
          breadcrumbJsonLd(siteUrl, [
            { name: t('footer.home'), path: lp('/') },
            { name: t('footer.archive'), path: lp('/archive') },
            { name: projectTitle(project, locale), path: location.pathname },
          ]),
          projectJsonLd(siteUrl, project, locale),
        ]}
      />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <Link to={lp('/')} className="font-display font-bold text-4xl md:text-5xl tracking-tighter hover:opacity-60 transition-opacity">AURA.</Link>
        <Link to={backLink} className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase hover:opacity-60 transition-opacity">
          <ArrowLeft size={16} /> <span>{backText}</span>
        </Link>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="h-[calc(var(--vh,1svh)*100)] w-[95vw] mx-auto pt-[calc(var(--vh,1svh)*2.5)] relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full rounded-t-[2rem] md:rounded-t-[3rem] overflow-hidden relative shadow-2xl"
        >
          <motion.img
            src={project.coverImage}
            alt={projectTitle(project, locale)}
            style={{ scale: heroScale, y: heroY }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 pb-10 md:pb-20 text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl md:text-8xl lg:text-[8vw] font-bold leading-[0.85] tracking-tighter uppercase max-w-5xl"
            >
              {projectTitle(project, locale)}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm md:text-lg font-light uppercase tracking-widest text-white/80"
            >
              <div className="flex items-center gap-2"><MapPin size={16} className="md:w-5 md:h-5" /> {project.location}</div>
              <div className="flex items-center gap-2"><Calendar size={16} className="md:w-5 md:h-5" /> {project.date}</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-24 md:py-40 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl lg:text-5xl font-light leading-snug tracking-tight text-gray-900"
        >
          "{projectDescription(project, locale)}"
        </motion.p>
      </section>

      {/* Gallery Grid */}
      <section className="px-4 md:px-10 pb-24 md:pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {project.gallery.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              onClick={() => setLightboxIndex(i)}
              className={`rounded-[2rem] overflow-hidden shadow-xl cursor-pointer group ${i % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/5]'} `}
            >
              <img src={img} alt={`${projectTitle(project, locale)} — poza ${i + 1}`} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[101]"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={32} />
            </button>

            {project.gallery.length > 1 && (
              <>
                <button
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[101]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex - 1 + project.gallery.length) % project.gallery.length);
                  }}
                >
                  <ChevronLeft size={48} />
                </button>
                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4 z-[101]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % project.gallery.length);
                  }}
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={project.gallery[lightboxIndex]}
              alt={`Gallery ${lightboxIndex}`}
              className="max-w-[90vw] max-h-[calc(var(--vh,1svh)*90)] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Project Footer */}
      <Link to={lp(`/project/${nextProject.id}`)} state={location.state} className="block w-full py-24 md:py-40 bg-gray-900 text-white text-center hover:bg-black transition-colors group cursor-pointer">
        <p className="uppercase tracking-widest text-sm text-gray-400 mb-6 font-medium">{t('projectDetails.nextProject')}</p>
        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase inline-flex items-center gap-6">
          {projectTitle(nextProject, locale)}
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 20 }}
            className="hidden md:block transition-transform"
          >
            <ArrowRight size={80} className="text-white/50 group-hover:text-white transition-colors" />
          </motion.div>
        </h2>
      </Link>
      <Footer />
    </div>
  );
}
