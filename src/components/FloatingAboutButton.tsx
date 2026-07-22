import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { stripLocalePrefix } from '../lib/localePaths';

export default function FloatingAboutButton() {
  const location = useLocation();
  const lp = useLocalizedPath();
  const [bottomOffset, setBottomOffset] = useState(0);
  const ringText = 'ABOUT ME \u2022 LAURENTIU PIRPILIU \u2022 ABOUT ME \u2022 LAURENTIU PIRPILIU \u2022';

  // Ancoră fixă, NEtransformată. Poziția ei nu se schimbă niciodată, deci e o
  // referință de măsurare stabilă. Translate-ul se aplică pe div-ul dinăuntru.
  //
  // Varianta anterioară măsura chiar elementul animat și îi aduna înapoi
  // offset-ul țintă. În timpul tranziției de 0.1s poziția randată e la mijlocul
  // drumului, dar offset-ul citit era cel final — deci măsurătoarea ieșea
  // greșită, genera un offset greșit, care genera altă măsurătoare greșită.
  // Bucla asta de feedback era aruncătura în sus și tremuratul.
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const anchor = anchorRef.current;
      const footer = document.querySelector('footer');
      if (!anchor || !footer) {
        setBottomOffset(0);
        return;
      }

      // Ancora e `fixed bottom-X`, deci marginea de jos a viewport-ului e
      // marginea ei de jos plus distanța `bottom`. Nicio dependență de starea
      // animației și niciun window.innerHeight.
      const anchorRect = anchor.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(anchor).bottom) || 0;
      const viewportBottom = anchorRect.bottom + gap;
      const footerTop = footer.getBoundingClientRect().top;

      // Rotunjim la pixel întreg și sărim setState-ul dacă valoarea nu s-a
      // schimbat: fără asta, sub-pixelii din scroll re-randează inutil și
      // adaugă tremur.
      const next = footerTop < viewportBottom ? Math.round(viewportBottom - footerTop) : 0;
      setBottomOffset(prev => (prev === next ? prev : next));
    };

    // O singură măsurătoare per frame, ca să nu forțeze layout la fiecare event.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  // Hide on the about page, admin page, and login page
  const basePath = stripLocalePrefix(location.pathname);
  if (basePath === '/about' || basePath === '/admin' || basePath === '/login') return null;

  return (
    <div
      ref={anchorRef}
      className="fixed bottom-3 right-3 md:bottom-10 md:right-10 z-50 pointer-events-none"
    >
      {/* Fără transition: offset-ul se recalculează la fiecare frame de scroll,
          deci butonul urmărește footer-ul 1:1, ca un element lipit. O tranziție
          CSS ar rămâne mereu în urma țintei și ar da senzația de „săltăreț". */}
      <div style={{ transform: `translateY(-${bottomOffset}px)`, willChange: 'transform' }}>
        <Link to={lp('/about')} className="block group pointer-events-auto">
          <div className="relative h-24 w-24 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-2xl md:h-36 md:w-36">
            <div className="absolute inset-0 rounded-full bg-black"></div>
            {/* Rotating Text */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-full h-full"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path id="aboutButtonCirclePath" d="M 50, 50 m 0, -43 a 43,43 0 1,1 0,86 a 43,43 0 1,1 0,-86" fill="none" />
                <text fill="white" fontSize="7.4" fontWeight="900" letterSpacing="0" textLength="270" lengthAdjust="spacing" className="font-sans uppercase">
                  <textPath href="#aboutButtonCirclePath" startOffset="0">
                    {ringText}
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Center Avatar */}
            <div className="absolute left-1/2 top-1/2 z-10 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f4f5] overflow-hidden pointer-events-none">
               <img
                  src="/laurentiu.png"
                  alt="Laurentiu"
                  className="w-full h-full object-cover"
               />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
