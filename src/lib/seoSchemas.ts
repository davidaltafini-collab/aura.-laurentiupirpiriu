import { Project, projectTitle, projectDescription, Locale } from '../data';

/**
 * Date de business folosite în JSON-LD și meta tags. Cele marcate TODO sunt
 * placeholder — trebuie înlocuite cu datele reale ale afacerii (telefon,
 * adresă, rețele sociale) înainte de lansare, altfel Google Business
 * Profile și schema.org vor fi inconsistente (rău pentru SEO local).
 */
export const BUSINESS = {
  name: 'Aura',
  legalName: 'Aura — Wedding & Drone Cinematography by Laurentiu Pirpiriu',
  founder: 'Laurentiu Pirpiriu',
  descriptionRo: 'Fotografie și cinematografie artistică de nuntă, inclusiv filmări cu drona — Laurentiu Pirpiriu documentează povești de dragoste în România și internațional.',
  descriptionEn: 'Artistic wedding photography and cinematography, including drone footage — Laurentiu Pirpiriu documents love stories across Romania and worldwide.',
  // TODO: înlocuiește cu datele reale ale afacerii
  telephone: '+40 700 000 000',
  areaServed: ['România', 'Europa'],
  sameAs: [] as string[], // TODO: linkuri Instagram/Facebook/YouTube reale
};

const DEFAULT_OG_IMAGE = '/placeholders/wedding-2.jpg';

export function photographyBusinessJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PhotographyBusiness',
    name: BUSINESS.name,
    alternateName: BUSINESS.legalName,
    url: siteUrl,
    image: DEFAULT_OG_IMAGE,
    description: BUSINESS.descriptionRo,
    telephone: BUSINESS.telephone,
    areaServed: BUSINESS.areaServed,
    founder: {
      '@type': 'Person',
      name: BUSINESS.founder,
    },
    sameAs: BUSINESS.sameAs,
  };
}

export function breadcrumbJsonLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function projectJsonLd(siteUrl: string, project: Project, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: projectTitle(project, locale),
    description: projectDescription(project, locale),
    author: { '@type': 'Person', name: BUSINESS.founder },
    locationCreated: project.location,
    image: [project.coverImage, ...project.gallery],
    url: `${siteUrl}/project/${project.id}`,
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
