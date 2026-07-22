import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLockup from '../components/BrandLockup';
import { scrollToPageTop } from '../lib/scroll';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (session) navigate('/admin');
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError('Email sau parolă incorecte.');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-svh font-sans bg-white selection:bg-black selection:text-white flex flex-col md:flex-row">
      {/* Panou imagine (ascuns pe mobil) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gray-100 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          src="/placeholders/wedding-1.webp"
          alt="CAPTUR."
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-10 left-10 z-10">
          <Link to="/" onClick={scrollToPageTop} className="text-white hover:opacity-80 transition-opacity duration-300">
            <BrandLockup markClassName="text-2xl" signatureClassName="text-lg" />
          </Link>
        </div>
        <div className="absolute bottom-12 left-12 z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl lg:text-6xl font-display tracking-tighter font-bold mb-6 leading-[1.05]">
              În spatele fiecărui cadru,<br />o poveste.
            </h2>
            <p className="text-white/80 font-medium text-lg">
              Acces doar pentru echipă.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Panou formular */}
      <div className="flex-1 flex flex-col min-h-svh relative">
        {/* Nav mobil */}
        <nav className="p-6 flex md:hidden justify-between items-center bg-white z-50">
          <Link to="/" onClick={scrollToPageTop} className="hover:opacity-60 transition-opacity">
            <BrandLockup className="flex-col items-start gap-0.5" markClassName="text-xl" signatureClassName="text-sm" />
          </Link>
          <Link to="/" onClick={scrollToPageTop} className="flex items-center gap-2 font-medium text-xs tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} /> Înapoi
          </Link>
        </nav>

        {/* Buton back desktop */}
        <div className="hidden md:block absolute top-10 right-12 z-50">
          <Link to="/" onClick={scrollToPageTop} className="flex items-center gap-2 font-medium text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors">
            Înapoi la site
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter mb-4">Bine ai revenit.</h1>
              <p className="text-gray-500 mb-12 text-lg">Intră cu contul tău ca să administrezi portofoliul.</p>

              <form onSubmit={handleLogin} className="flex flex-col gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email</label>
                  <input
                    type="email"
                    placeholder="nume@exemplu.ro"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-lg focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Parolă</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-lg focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-red-500 text-sm font-medium pt-2">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full bg-black text-white rounded-full px-8 py-5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Se conectează...' : 'Intră în workspace'}
                  {!submitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
