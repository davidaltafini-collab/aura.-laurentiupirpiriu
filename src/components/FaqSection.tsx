import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaqItem, faqQuestion, faqAnswer } from '../data/faq';
import { useLocale } from '../hooks/useLocale';

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <section className="py-24 md:py-40 px-6 md:px-12 max-w-5xl mx-auto">
      <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-12 md:mb-16">
        {t('faq.heading')}
      </h2>
      <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const question = faqQuestion(item, locale);
          return (
            <div key={question} className="py-6 md:py-8">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-6 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-display text-xl md:text-2xl font-semibold tracking-tight">{question}</span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }} className="shrink-0 text-gray-400">
                  <Plus size={24} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="text-gray-600 text-base md:text-lg leading-relaxed pt-4 max-w-2xl">{faqAnswer(item, locale)}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
