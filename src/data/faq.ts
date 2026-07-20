import type { Locale } from '../data';

export interface FaqItem {
  questionRo: string;
  answerRo: string;
  questionEn: string;
  answerEn: string;
}

export function faqQuestion(item: FaqItem, locale: Locale): string {
  return locale === 'ro' ? item.questionRo : item.questionEn;
}

export function faqAnswer(item: FaqItem, locale: Locale): string {
  return locale === 'ro' ? item.answerRo : item.answerEn;
}

/**
 * Conținut FAQ — util atât pentru SEO clasic (featured snippets Google),
 * cât și pentru GEO (motoarele AI citează des conținut structurat tip
 * întrebare/răspuns). Răspunsurile evită cifre exacte (preț, termen de
 * livrare) pe care nu le cunoaștem — completează-le cu date reale când sunt
 * disponibile de la client.
 */
export const HOME_FAQ: FaqItem[] = [
  {
    questionRo: 'Cu cât timp înainte ar trebui să rezervăm un fotograf de nuntă?',
    answerRo: 'Recomandăm rezervarea cât mai devreme posibil, ideal cu 6–12 luni înainte de eveniment, mai ales pentru datele din sezonul cald (mai–octombrie), când disponibilitatea se ocupă rapid.',
    questionEn: 'How far in advance should we book a wedding photographer?',
    answerEn: 'We recommend booking as early as possible, ideally 6–12 months ahead of your event, especially for peak-season dates (May–October), which fill up quickly.',
  },
  {
    questionRo: 'Faceți și filmări cu drona la nunți?',
    answerRo: 'Da — filmările aeriene cu drona fac parte din pachetele Aura, alături de fotografie și cinematografie de la sol, pentru un rezultat cinematic complet.',
    questionEn: 'Do you also offer drone footage at weddings?',
    answerEn: 'Yes — aerial drone footage is part of every Aura package, alongside ground photography and cinematography, for a complete cinematic result.',
  },
  {
    questionRo: 'Călătoriți pentru nunți în afara țării (destination wedding)?',
    answerRo: 'Da, Laurentiu documentează nunți atât în România, cât și internațional — portofoliul include evenimente în Italia, Elveția și Statele Unite.',
    questionEn: 'Do you travel for destination weddings?',
    answerEn: 'Yes, Laurentiu documents weddings both in Romania and internationally — the portfolio includes events in Italy, Switzerland, and the United States.',
  },
  {
    questionRo: 'Ce zone din România deserviți?',
    answerRo: 'Aura este disponibil pentru nunți în toată România — București, Cluj-Napoca, Timișoara, Iași, Brașov și zonele înconjurătoare — precum și pentru evenimente internaționale.',
    questionEn: 'Which areas of Romania do you cover?',
    answerEn: 'Aura is available for weddings across Romania — Bucharest, Cluj-Napoca, Timișoara, Iași, Brașov and surrounding areas — as well as for international events.',
  },
  {
    questionRo: 'Cum aflăm disponibilitatea și detaliile pentru data noastră?',
    answerRo: 'Cel mai simplu e să completați formularul de contact de pe site cu data evenimentului — Laurentiu vă răspunde direct pe email cu disponibilitatea și detaliile pachetelor.',
    questionEn: 'How do we check availability and pricing for our date?',
    answerEn: 'The easiest way is to fill out the contact form with your event date — Laurentiu will reply directly by email with availability and package details.',
  },
  {
    questionRo: 'Ce stil de fotografie și filmare practicați?',
    answerRo: 'Un stil cinematic, editorial, cu abordare discretă (documentary-style) — cuplurile sunt filmate natural, fără regizare excesivă, completat de cadre aeriene pentru perspective unice.',
    questionEn: 'What photography and filming style do you use?',
    answerEn: 'A cinematic, editorial style with a discreet, documentary-style approach — couples are captured naturally, without excessive direction, complemented by aerial shots for unique perspectives.',
  },
];

export const AREAS_SERVED = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Destination Wedding',
];
