import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { stripLocalePrefix } from '../lib/localePaths';

export default function FloatingAboutButton() {
  const location = useLocation();
  const lp = useLocalizedPath();
  const [bottomOffset, setBottomOffset] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const footer = document.querySelector('footer');
      const el = wrapperRef.current;
      if (!footer || !el) {
        offsetRef.current = 0;
        setBottomOffset(0);
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;

      // Marginea de jos a viewport-ului, dedusă din geometria butonului în loc
      // de window.innerHeight: butonul e `fixed bottom-X`, deci marginea de jos
      // a viewport-ului = marginea lui de jos în repaus + distanța `bottom`.
      // Anulăm translate-ul deja aplicat ca să obținem poziția de repaus.
      const restBottom = el.getBoundingClientRect().bottom + offsetRef.current;
      const gap = parseFloat(getComputedStyle(el).bottom) || 0;
      const viewportBottom = restBottom + gap;

      const next = footerTop < viewportBottom ? viewportBottom - footerTop : 0;
      offsetRef.current = next;
      setBottomOffset(next);
    };

    // Măsurătoarea forțează layout; într-un rAF se face o singură dată per frame,
    // nu la fiecare eveniment de scroll.
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  // Hide on the about page, admin page, and login page
  const basePath = stripLocalePrefix(location.pathname);
  if (basePath === '/about' || basePath === '/admin' || basePath === '/login') return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 pointer-events-none"
      style={{ transform: `translateY(-${bottomOffset}px)`, transition: 'transform 0.1s ease-out' }}
    >
      <Link to={lp('/about')} className="block group pointer-events-auto">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-black"></div>
          {/* Rotating Text */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-full h-full"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
              <text fill="white" fontSize="10" fontWeight="bold" letterSpacing="0.25em" className="font-sans uppercase">
                <textPath href="#circlePath" startOffset="0%">
                  ABOUT ME • LAURENTIU PIRPIRIU •
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Center Avatar */}
          <div className="absolute w-[60%] h-[60%] rounded-full bg-[#f4f4f5] overflow-hidden flex items-center justify-center z-10 pointer-events-none">
             <img
                src="/laurentiu.png"
                alt="Laurentiu"
                className="w-full h-full object-cover"
             />
          </div>
        </div>
      </Link>
    </div>
  );
}
