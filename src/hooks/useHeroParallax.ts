import { useRef } from 'react';
import { useScroll, useTransform, useReducedMotion } from 'motion/react';

/**
 * Zoom + parallax pe poza dintr-un hero, legate de scroll.
 *
 * Reconstruiește intenționat efectul care înainte apărea din bug: hero-ul își
 * schimba înălțimea când se mișcau barele browserului, poza cu object-cover se
 * re-scala ca să-l acopere, iar secțiunea părea că se întinde în jos. Acolo se
 * anima `height` — proprietate de layout, deci împingea tot conținutul de sub ea.
 *
 * Aici se animă exclusiv `transform` (scale + translateY). Transform-ul nu
 * participă la layout: browserul îl aplică la compoziting, după ce pozițiile
 * sunt deja calculate. Poza se poate mări și deplasa oricât, nimic de sub ea
 * nu se mișcă.
 *
 * Progresul se calculează din scrollY BRUT, nu din geometria elementului față
 * de viewport. E diferența importantă: scrollY nu se schimbă când apar/dispar
 * barele browserului, deci efectul nu tresare exact în acel moment — capcana în
 * care ar fi căzut un useScroll cu target/offset.
 *
 * @param restScale scara în repaus (păstrează aspectul inițial al paginii)
 * @param zoom      cât se adaugă la scară pe toată lungimea hero-ului
 * @param drift     deplasarea pe verticală la final, ca fracțiune din înălțimea
 *                  hero-ului. E plafonată automat la 90% din surplusul disponibil
 *                  la momentul respectiv, ca poza să nu se desprindă niciodată de
 *                  marginea de sus, indiferent ce valori se aleg aici.
 * @param span      pe ce fracțiune din înălțimea hero-ului se consumă efectul.
 *                  Sub 1 înseamnă că se termină înainte ca hero-ul să iasă complet
 *                  din ecran — esențial ca mișcarea să fie perceptibilă: întinsă
 *                  pe toată înălțimea, deplasarea pe primii 200px de scroll e prea
 *                  mică pentru a se observa.
 */
export function useHeroParallax(restScale: number, zoom: number, drift: number, span = 0.55) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const heightOf = () => ref.current?.offsetHeight || 800;
  const progress = (y: number) => Math.min(Math.max(y / (heightOf() * span), 0), 1);

  const scale = useTransform(scrollY, y =>
    reduceMotion ? restScale : restScale + progress(y) * zoom,
  );

  const y = useTransform(scrollY, value => {
    if (reduceMotion) return 0;
    const p = progress(value);
    // Surplusul de poză disponibil pe fiecare margine la scara curentă. Peste el,
    // deplasarea ar descoperi fundalul containerului în partea de sus.
    const overflow = (restScale - 1 + zoom * p) / 2;
    return Math.min(p * drift, overflow * 0.9) * heightOf();
  });

  return { ref, scale, y };
}
