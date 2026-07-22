import { useState } from 'react';
import { Mail, MapPin, Camera, X, Upload, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { compressToDataUrl } from '../lib/imageCompress';
import LanguageSwitcher from './LanguageSwitcher';

const SESSION_KEY = 'aura_photo_sent';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function Footer() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();

  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SendStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadySent, setAlreadySent] = useState(false);

  const openModal = () => {
    setAlreadySent(sessionStorage.getItem(SESSION_KEY) === '1');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Reset la închidere, după ce animația de ieșire se termină.
    setTimeout(() => {
      setImage(null);
      setEmail('');
      setMessage('');
      setStatus('idle');
      setErrorMsg('');
    }, 300);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setStatus('idle');
    setErrorMsg('');
    // Comprimă înainte de preview ȘI trimitere: același data URL pentru ambele.
    const dataUrl = await compressToDataUrl(file);
    setImage(dataUrl);
  };

  const handleSend = async () => {
    if (!image || !email.trim() || status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/photo-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, email: email.trim(), message, sourcePage: window.location.pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) throw new Error(t('photoModal.rateLimited'));
        throw new Error(data.error || t('photoModal.genericError'));
      }
      sessionStorage.setItem(SESSION_KEY, '1');
      setStatus('sent');
      setTimeout(closeModal, 2200);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t('photoModal.genericError'));
    }
  };

  return (
    <>
      <footer className="py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 mt-auto bg-[#f8f8f7]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to={lp('/')} className="font-display font-bold text-2xl tracking-tighter">AURA.</Link>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium text-xs md:text-sm tracking-wide uppercase text-gray-500">
            <Link to={lp('/')} className="hover:text-black transition-colors">{t('footer.home')}</Link>
            <Link to={lp('/about')} className="hover:text-black transition-colors">{t('footer.about')}</Link>
            <Link to={lp('/archive')} className="hover:text-black transition-colors">{t('footer.archive')}</Link>
            <a href={`${lp('/')}#contact`} className="hover:text-black transition-colors">{t('footer.contact')}</a>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-500">
          <button onClick={openModal} title={t('photoModal.trigger')} aria-label={t('photoModal.trigger')} className="hover:text-black transition-colors">
            <Camera size={20} />
          </button>
          <a href="#" className="hover:text-black transition-colors"><Mail size={20} /></a>
          <a href="#" className="hover:text-black transition-colors"><MapPin size={20} /></a>
          <LanguageSwitcher className="text-gray-500" />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-xs md:text-sm text-gray-400 uppercase tracking-wider text-center">
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <Link to="/login" className="hover:text-black transition-colors">{t('footer.admin')}</Link>
        </div>
      </footer>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-display font-bold text-xl tracking-tight text-black">{t('photoModal.title')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('photoModal.subtitle')}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                  aria-label="Închide"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                {status === 'sent' ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <p className="text-lg font-medium">{t('photoModal.sentTitle')}</p>
                    <p className="text-sm text-gray-500 max-w-xs">{t('photoModal.sentBody')}</p>
                  </div>
                ) : alreadySent ? (
                  <p className="text-center text-gray-500 max-w-xs">{t('photoModal.alreadySent')}</p>
                ) : image ? (
                  <div className="w-full flex flex-col gap-5">
                    <div className="w-full h-40 relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                          {t('photoModal.changePhoto')}
                          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <input
                      type="email"
                      placeholder={t('photoModal.emailPlaceholder')}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                    <textarea
                      placeholder={t('photoModal.messagePlaceholder')}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4">
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                      className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-black transition-all group p-6 text-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-gray-400 group-hover:text-black transition-colors" />
                      </div>
                      <div>
                        <span className="font-medium text-black block mb-1">{t('photoModal.browseTitle')}</span>
                        <span className="text-sm text-gray-500">{t('photoModal.browseHint')}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
                    </label>
                    <label className="w-full py-4 border-2 border-gray-200 rounded-[2rem] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-black transition-all group font-medium text-gray-600">
                      <Camera size={20} className="text-gray-400 group-hover:text-black" />
                      {t('photoModal.takePhoto')}
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Footer */}
              {status !== 'sent' && !alreadySent && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  {status === 'error' && (
                    <p className="text-red-500 text-sm text-center font-medium mb-3">{errorMsg}</p>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={!image || !email.trim() || status === 'sending'}
                    className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> {t('photoModal.sending')}
                      </>
                    ) : (
                      <>
                        {t('photoModal.send')} <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
