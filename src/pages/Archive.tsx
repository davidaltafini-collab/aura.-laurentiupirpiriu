import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useLocale } from '../hooks/useLocale';
import { useSiteUrl } from '../hooks/useSiteUrl';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { projectTitle } from '../data';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { breadcrumbJsonLd } from '../lib/seoSchemas';

export default function Archive() {
  const { projects } = useProjects();
  const locale = useLocale();
  const { t } = useTranslation();
  const siteUrl = useSiteUrl();
  const location = useLocation();
  const lp = useLocalizedPath();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !projects.find(p => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen font-sans bg-[#f8f8f7] selection:bg-black selection:text-white pb-20">
      <Seo
        title={locale === 'ro' ? 'Arhivă completă de proiecte' : 'Full project archive'}
        description={locale === 'ro'
          ? 'Toate proiectele foto și video Aura — nunți documentate cu un stil cinematic, editorial, în România și internațional.'
          : 'All Aura photo and video projects — weddings documented in a cinematic, editorial style, across Romania and internationally.'}
        path={location.pathname}
        jsonLd={breadcrumbJsonLd(siteUrl, [
          { name: t('footer.home'), path: lp('/') },
          { name: t('footer.archive'), path: location.pathname },
        ])}
      />
      {/* Nav */}
      <nav className="p-4 md:p-10 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <Link to={lp('/')} className="font-display font-bold text-xl md:text-2xl tracking-tighter hover:opacity-60 transition-opacity">
          AURA. <span className="text-gray-400 font-light tracking-normal text-lg md:text-xl ml-2">{t('archive.kicker')}</span>
        </Link>
        <Link to={lp('/')} className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={16} /> <span>{t('footer.home')}</span>
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">{t('archive.allProjects')}</h3>
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`text-left px-6 py-5 rounded-[2rem] transition-all duration-300 ${
                  selectedProjectId === project.id
                    ? 'bg-black text-white shadow-xl scale-[1.02]'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <div className="font-semibold text-lg">{projectTitle(project, locale)}</div>
                <div className={`text-sm mt-1 ${selectedProjectId === project.id ? 'text-gray-400' : 'text-gray-400'}`}>
                  {project.date}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {selectedProject && (
            <motion.div
              key={selectedProject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">{projectTitle(selectedProject, locale)}</h2>
                  <p className="text-gray-500 mt-2 text-lg">{selectedProject.location}</p>
                </div>
                <Link
                  to={lp(`/project/${selectedProject.id}`)}
                  state={{ from: 'archive' }}
                  className="bg-black text-white px-6 py-3 rounded-full font-medium text-sm tracking-wide uppercase hover:scale-105 transition-transform duration-300 flex items-center gap-2 w-fit"
                >
                  {t('archive.viewCaseStudy')} <ArrowRight size={16} />
                </Link>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[selectedProject.coverImage, ...selectedProject.gallery].map((img, i) => (
                  <Link
                    to={lp(`/project/${selectedProject.id}`)}
                    state={{ from: 'archive' }}
                    key={i}
                    className="group relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
                  >
                    <img src={img} alt={`${projectTitle(selectedProject, locale)} — poza ${i + 1}`} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
