import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen font-sans bg-[#f8f8f7] selection:bg-black selection:text-white flex flex-col">
      {/* Nav */}
      <nav className="p-4 md:p-10 flex justify-between items-center bg-transparent z-50">
        <Link to="/" className="font-display font-bold text-xl md:text-2xl tracking-tighter hover:opacity-60 transition-opacity">
          AURA.
        </Link>
        <Link to="/" className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back Home</span><span className="sm:hidden">Back</span>
        </Link>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white p-10 md:p-14 rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
          
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={24} className="text-black" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tighter uppercase mb-2">Workspace Access</h1>
            <p className="text-gray-500 text-sm">Intră cu contul tău ca să administrezi portofoliul.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-black transition-colors"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Parolă"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:border-black transition-colors"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full bg-black text-white rounded-xl px-8 py-4 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Se conectează...' : 'Sign In'}
              {!submitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
