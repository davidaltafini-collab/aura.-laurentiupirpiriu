import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './i18n/config';
import './index.css';

declare global {
  interface Window {
    __capturAppReady?: () => void;
  }
}

function CapturApp() {
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__capturAppReady?.();
        window.dispatchEvent(new Event('captur:app-ready'));
      });
    });
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CapturApp />
  </StrictMode>,
);
