import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { stripLocalePrefix } from '../lib/localePaths';

export default function FloatingAboutButton() {
  const location = useLocation();
  const lp = useLocalizedPath();
  const [bottomOffset, setBottomOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (footerRect.top < windowHeight) {
          const overlap = windowHeight - footerRect.top;
          setBottomOffset(overlap);
        } else {
          setBottomOffset(0);
        }
      } else {
        setBottomOffset(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);
  
  // Hide on the about page, admin page, and login page
  const basePath = stripLocalePrefix(location.pathname);
  if (basePath === '/about' || basePath === '/admin' || basePath === '/login') return null;

  return (
    <div
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
