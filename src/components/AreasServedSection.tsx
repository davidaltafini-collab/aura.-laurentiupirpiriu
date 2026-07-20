import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AREAS_SERVED } from '../data/faq';

export default function AreasServedSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
      <p className="uppercase tracking-widest text-sm text-gray-400 font-medium mb-6">{t('areasServed.heading')}</p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {AREAS_SERVED.map((area, i) => (
          <motion.span
            key={area}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm md:text-base font-medium text-gray-700 shadow-sm"
          >
            <MapPin size={14} className="text-gray-400" /> {area}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
