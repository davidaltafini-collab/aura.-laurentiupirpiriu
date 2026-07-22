import { useEffect } from 'react';

const SITE_NAME = 'CAPTUR. — Wedding & Drone Cinematography';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: object | object[];
}

export default function Seo({ title, description, path, image, type = 'website', jsonLd }: SeoProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const origin = window.location.origin;
    const url = `${origin}${path}`;

    setMetaByName('description', description);

    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:type', type);
    setMetaByProperty('og:url', url);
    setMetaByProperty('og:site_name', SITE_NAME);
    setMetaByProperty('og:locale', 'ro_RO');
    if (image) setMetaByProperty('og:image', image);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', description);
    if (image) setMetaByName('twitter:image', image);

    setCanonical(url);
    setJsonLd(jsonLd);
  }, [title, description, path, image, type, jsonLd]);

  return null;
}

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

const JSON_LD_ID = 'seo-json-ld';

function setJsonLd(data?: object | object[]) {
  const existing = document.getElementById(JSON_LD_ID);
  if (existing) existing.remove();
  if (!data) return;

  const script = document.createElement('script');
  script.id = JSON_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
