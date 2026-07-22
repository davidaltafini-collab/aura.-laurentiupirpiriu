import { useState, useRef, useEffect } from 'react';
import { Mail, MapPin, Camera, X, Upload, Send, CheckCircle2, Loader2, SwitchCamera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { compressToDataUrl } from '../lib/imageCompress';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLockup from './BrandLockup';

const SESSION_KEY = 'captur_photo_sent';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';
type Facing = 'user' | 'environment';

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

  // Cameră în pagină (getUserMedia). Pornim pe camera din spate și păstrăm
  // cadrul ne-oglindit, ca poza trimisă să arate exact ca în realitate.
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facing, setFacing] = useState<Facing>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Pornește / repornește stream-ul când se deschide camera sau se schimbă
  // obiectivul (față/spate).
  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;

    (async () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError(t('photoModal.cameraError'));
        setCameraOpen(false);
      }
    })();

    return () => { active = false; };
  }, [cameraOpen, facing, t]);

  // Plasă de siguranță: dacă modalul dispare din DOM, nu lăsăm camera pornită.
  useEffect(() => () => stopCamera(), []);

  const openModal = () => {
    setAlreadySent(sessionStorage.getItem(SESSION_KEY) === '1');
    setModalOpen(true);
  };

  const closeModal = () => {
    stopCamera();
    setCameraOpen(false);
    setModalOpen(false);
    // Reset la închidere, după ce animația de ieșire se termină.
    setTimeout(() => {
      setImage(null);
      setEmail('');
      setMessage('');
      setStatus('idle');
      setErrorMsg('');
      setCameraError('');
    }, 300);
  };

  const openCamera = () => {
    setCameraError('');
    if (navigator.mediaDevices?.getUserMedia) {
      setFacing('environment');
      setCameraOpen(true);
    } else {
      // Browser fără getUserMedia: camera nativă a sistemului.
      fallbackInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Desenăm cadrul așa cum e — fără scaleX(-1), deci fără oglindire.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
    setCameraOpen(false);
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
          <Link to={lp('/')} className="hover:opacity-70 transition-opacity">
            <BrandLockup markClassName="text-2xl" signatureClassName="text-lg" />
          </Link>

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
                {cameraOpen ? (
                  <div className="w-full flex flex-col gap-5">
                    <div className="w-full aspect-[3/4] max-h-[50vh] relative rounded-2xl overflow-hidden bg-black">
                      {/* Fără scaleX(-1): previzualizarea NU e oglindită. */}
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))}
                        title={t('photoModal.flipCamera')}
                        aria-label={t('photoModal.flipCamera')}
                        className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <SwitchCamera size={20} />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => { stopCamera(); setCameraOpen(false); }}
                        className="px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                      >
                        {t('photoModal.cancelCamera')}
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        aria-label={t('photoModal.capture')}
                        className="w-16 h-16 rounded-full bg-black flex items-center justify-center hover:scale-105 transition-transform ring-4 ring-black/10"
                      >
                        <span className="w-12 h-12 rounded-full border-2 border-white" />
                      </button>
                      <span className="w-[4.75rem]" aria-hidden />
                    </div>
                  </div>
                ) : status === 'sent' ? (
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
                    <button
                      type="button"
                      onClick={openCamera}
                      className="w-full py-4 border-2 border-gray-200 rounded-[2rem] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-black transition-all group font-medium text-gray-600"
                    >
                      <Camera size={20} className="text-gray-400 group-hover:text-black" />
                      {t('photoModal.takePhoto')}
                    </button>
                    {cameraError && (
                      <p className="text-red-500 text-sm text-center font-medium">{cameraError}</p>
                    )}
                    {/* Fallback pentru browsere fără getUserMedia: camera nativă. */}
                    <input
                      ref={fallbackInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              {!cameraOpen && status !== 'sent' && !alreadySent && (
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
