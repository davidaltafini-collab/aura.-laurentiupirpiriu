import { Project, projectTitle, projectDescription, Locale } from '../data';

export const BUSINESS = {
  name: 'CAPTUR.',
  legalName: 'CAPTUR. - Wedding & Drone Cinematography by Laurentiu Pirpiliu',
  founder: 'Laurentiu Pirpiliu',
  descriptionRo: 'Fotografie si cinematografie artistica de nunta, inclusiv filmari cu drona - Laurentiu Pirpiliu documenteaza povesti de dragoste in Romania si international.',
  descriptionEn: 'Artistic wedding photography and cinematography, including drone footage - Laurentiu Pirpiliu documents love stories across Romania and worldwide.',
  areaServed: ['Romania', 'Europe'],
  sameAs: [] as string[],
};

const DEFAULT_OG_IMAGE = '/placeholders/wedding-2.webp';

export function photographyBusinessJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PhotographyBusiness',
    name: BUSINESS.name,
    alternateName: BUSINESS.legalName,
    url: siteUrl,
    image: DEFAULT_OG_IMAGE,
    description: BUSINESS.descriptionRo,
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
