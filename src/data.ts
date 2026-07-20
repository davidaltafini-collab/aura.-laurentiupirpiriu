export type Locale = 'ro' | 'en';

export interface Project {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  location: string;
  date: string;
  coverImage: string;
  gallery: string[];
  descriptionRo: string;
  descriptionEn: string;
  featured: boolean;
  sortOrder: number;
}

export function projectTitle(project: Project, locale: Locale): string {
  return locale === 'ro' ? project.titleRo : project.titleEn;
}

export function projectDescription(project: Project, locale: Locale): string {
  return locale === 'ro' ? project.descriptionRo : project.descriptionEn;
}

/**
 * Date placeholder folosite doar cât timp Supabase nu e configurat (vezi .env.example
 * și supabase/schema.sql). Odată conectat Supabase, acestea sunt înlocuite din baza de date;
 * conținutul real (poze + texte) vine separat de la client.
 */
export const projects: Project[] = [
  {
    id: 'lake-como-romance',
    slug: 'lake-como-romance',
    titleRo: 'Poveste la Lacul Como',
    titleEn: 'Lake Como Romance',
    location: 'Lacul Como, Italia',
    date: 'Septembrie 2026',
    coverImage: '/placeholders/wedding-1.jpg',
    descriptionRo: 'O celebrare elegantă și atemporală pe malul Lacului Como. Lumina schimbătoare peste apă și vila istorică au oferit un decor cinematic pentru o poveste de dragoste plină de grație și bucurie.',
    descriptionEn: 'An elegant, timeless celebration on the shores of Lake Como. The changing light over the water and the historic villa provided a cinematic backdrop for a love story filled with grace and joy.',
    gallery: [
      '/placeholders/wedding-2.jpg',
      '/placeholders/wedding-3.jpg',
      '/placeholders/wedding-4.jpg',
    ],
    featured: true,
    sortOrder: 0,
  },
  {
    id: 'tuscany-estate',
    slug: 'tuscany-estate',
    titleRo: 'Domeniul din Toscana',
    titleEn: 'Tuscany Estate',
    location: 'Florența, Italia',
    date: 'Iulie 2026',
    coverImage: '/placeholders/wedding-5.jpg',
    descriptionRo: 'O nuntă rustică, dar rafinată, în dealurile line ale Toscanei. Ora de aur a învăluit viile într-o lumină caldă, în perfectă armonie cu energia vibrantă a cuplului.',
    descriptionEn: "A rustic yet refined wedding set amidst the rolling hills of Tuscany. The golden hour cast a warm glow over the vineyards, perfectly matching the couple's vibrant energy.",
    gallery: [
      '/placeholders/wedding-4.jpg',
      '/placeholders/wedding-5.jpg',
      '/placeholders/wedding-6.jpg',
    ],
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'alpine-elopement',
    slug: 'alpine-elopement',
    titleRo: 'Elopement Alpin',
    titleEn: 'Alpine Elopement',
    location: 'Alpii Elvețieni',
    date: 'Ianuarie 2026',
    coverImage: '/placeholders/wedding-5.jpg',
    descriptionRo: 'Un elopement intim și spectaculos, sus în vârfurile înzăpezite ale Alpilor Elvețieni. Aerul tăios și priveliștile montane dramatice au făcut fiecare cadru să pară monumental.',
    descriptionEn: 'A breathtaking, intimate elopement high in the snowy peaks of the Swiss Alps. The crisp air and dramatic mountain views made every frame feel epic and monumental.',
    gallery: [
      '/placeholders/wedding-1.jpg',
      '/placeholders/wedding-7.jpg',
      '/placeholders/wedding-2.jpg',
    ],
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'desert-mirage',
    slug: 'desert-mirage',
    titleRo: 'Miraj în Deșert',
    titleEn: 'Desert Mirage',
    location: 'Joshua Tree, SUA',
    date: 'Octombrie 2025',
    coverImage: '/placeholders/wedding-3.jpg',
    descriptionRo: 'Nuanțe calde de deșert și un stil minimalist au adus o notă boemă, modernă acestei celebrări sub cerul vast și deschis din Joshua Tree.',
    descriptionEn: 'Warm desert hues and minimalist styling brought a unique, modern bohemian vibe to this celebration under the vast open skies of Joshua Tree.',
    gallery: [
      '/placeholders/wedding-5.jpg',
      '/placeholders/wedding-5.jpg',
      '/placeholders/wedding-2.jpg',
    ],
    featured: true,
    sortOrder: 3,
  },
  {
    id: 'coastal-breeze',
    slug: 'coastal-breeze',
    titleRo: 'Briză de Coastă',
    titleEn: 'Coastal Breeze',
    location: 'Coasta Amalfi, Italia',
    date: 'August 2025',
    coverImage: '/placeholders/wedding-6.jpg',
    descriptionRo: 'Jurăminte pe stâncile de deasupra Mării Tireniene. Culorile vibrante ale Coastei Amalfi s-au împletit perfect cu estetica pasională și vie a cuplului.',
    descriptionEn: "Cliffside vows overlooking the Tyrrhenian Sea. The vibrant colors of the Amalfi Coast blended seamlessly with the couple's passionate, lively aesthetic.",
    gallery: [
      '/placeholders/wedding-5.jpg',
      '/placeholders/wedding-7.jpg',
      '/placeholders/wedding-2.jpg',
    ],
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'urban-chic',
    slug: 'urban-chic',
    titleRo: 'Șic Urban',
    titleEn: 'Urban Chic',
    location: 'New York City',
    date: 'Mai 2025',
    coverImage: '/placeholders/wedding-2.jpg',
    descriptionRo: 'O petrecere elegantă și modernă într-un loft din Manhattan. Skyline-ul orașului a oferit un contrast arhitectural dramatic pentru romantismul delicat al serii.',
    descriptionEn: 'A sleek, modern affair in a Manhattan loft. The city skyline offered a dramatic, architectural contrast to the delicate romance of the evening.',
    gallery: [
      '/placeholders/wedding-4.jpg',
      '/placeholders/wedding-3.jpg',
      '/placeholders/wedding-1.jpg',
    ],
    featured: true,
    sortOrder: 5,
  },
];
