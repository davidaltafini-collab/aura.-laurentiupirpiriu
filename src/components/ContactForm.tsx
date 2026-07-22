import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  message: string;
}

const initialState: FormState = { name: '', email: '', phone: '', eventDate: '', message: '' };

export default function ContactForm() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formattedEventDate = form.eventDate
    ? new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(`${form.eventDate}T00:00:00`))
    : '';
  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: window.location.pathname, locale }),
      });

      // Răspunsul poate să nu fie JSON: dacă funcția serverless nu e deployată
      // sau a crăpat la pornire, Vercel întoarce o pagină HTML de eroare. Fără
      // distincția asta, orice problemă arăta la fel — mesajul generic — și nu
      // se putea afla dacă e endpoint lipsă, config greșită sau eroare de date.
      const raw = await res.text();
      let data: { error?: string } = {};
      let isJson = true;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        isJson = false;
      }

      if (!res.ok || !isJson) {
        console.error('[contact] Trimitere eșuată', { status: res.status, isJson, raw: raw.slice(0, 500) });
        if (!isJson) {
          throw new Error(`Serverul a răspuns cu ${res.status} (răspuns non-JSON). Endpoint-ul /api/contact nu răspunde corect.`);
        }
        throw new Error(data.error || `${t('contactForm.genericError')} (cod ${res.status})`);
      }

      setStatus('success');
      setForm(initialState);
    } catch (err) {
      console.error('[contact] Eroare la trimitere:', err);
      setStatus('error');
      // Fetch aruncă TypeError doar când cererea nu ajunge deloc la server
      // (offline, DNS, CORS) — merită distins de o eroare venită din server.
      const isNetwork = err instanceof TypeError;
      setErrorMessage(
        isNetwork
          ? 'Nu am putut contacta serverul. Verifică conexiunea la internet și încearcă din nou.'
          : err instanceof Error ? err.message : t('contactForm.genericError'),
      );
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/10 border border-white/20 rounded-[2rem] px-8 py-12 text-center flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
          <Check size={28} className="text-black" />
        </div>
        <p className="text-white text-lg font-medium">{t('contactForm.successTitle')}</p>
        <p className="text-gray-400 text-sm max-w-xs">{t('contactForm.successBody')}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
      <input
        type="text"
        placeholder={t('contactForm.namePlaceholder')}
        value={form.name}
        onChange={update('name')}
        required
        className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3.5 md:px-8 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base md:text-lg"
      />
      <input
        type="email"
        placeholder={t('contactForm.emailPlaceholder')}
        value={form.email}
        onChange={update('email')}
        required
        className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3.5 md:px-8 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base md:text-lg"
      />
      <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <input
          type="tel"
          placeholder={t('contactForm.phonePlaceholder')}
          value={form.phone}
          onChange={update('phone')}
          className="w-full min-w-0 bg-white/10 border border-white/20 rounded-full px-6 py-3.5 md:px-8 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base md:text-lg"
        />
        <div className="relative w-full min-w-0 overflow-hidden rounded-full">
          <input
            type="date"
            aria-label={t('contactForm.eventDateSelectPlaceholder')}
            title={t('contactForm.eventDatePlaceholder')}
            placeholder={t('contactForm.eventDateSelectPlaceholder')}
            min={new Date().toISOString().split('T')[0]}
            value={form.eventDate}
            onClick={(event) => {
              try {
                event.currentTarget.showPicker?.();
              } catch {
                // Native tap/focus still opens the picker on browsers without showPicker support.
              }
            }}
            onChange={update('eventDate')}
            className="form-date-input peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
          />
          <div className="pointer-events-none flex min-h-[54px] w-full min-w-0 items-center truncate rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-base text-white transition-colors peer-focus:border-white md:min-h-[60px] md:px-8 md:py-4 md:text-lg">
            <span className={`block min-w-0 truncate ${form.eventDate ? 'text-white' : 'text-gray-400'}`}>
              {formattedEventDate || t('contactForm.eventDateSelectPlaceholder')}
            </span>
          </div>
        </div>
      </div>
      <textarea
        placeholder={t('contactForm.messagePlaceholder')}
        value={form.message}
        onChange={update('message')}
        required
        rows={3}
        className="w-full bg-white/10 border border-white/20 rounded-[1.75rem] px-6 py-3.5 md:px-8 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base md:text-lg resize-none"
      />

      <AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm px-2"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-white text-black rounded-full px-6 py-4 md:px-8 md:py-5 font-semibold text-base md:text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {status === 'submitting' ? t('contactForm.submitting') : t('contactForm.submit')}
        {status !== 'submitting' && <ArrowRight size={20} />}
      </button>
    </form>
  );
}
