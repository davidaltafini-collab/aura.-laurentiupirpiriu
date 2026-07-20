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
    coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'O celebrare elegantă și atemporală pe malul Lacului Como. Lumina schimbătoare peste apă și vila istorică au oferit un decor cinematic pentru o poveste de dragoste plină de grație și bucurie.',
    descriptionEn: 'An elegant, timeless celebration on the shores of Lake Como. The changing light over the water and the historic villa provided a cinematic backdrop for a love story filled with grace and joy.',
    gallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2938&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'O nuntă rustică, dar rafinată, în dealurile line ale Toscanei. Ora de aur a învăluit viile într-o lumină caldă, în perfectă armonie cu energia vibrantă a cuplului.',
    descriptionEn: "A rustic yet refined wedding set amidst the rolling hills of Tuscany. The golden hour cast a warm glow over the vineyards, perfectly matching the couple's vibrant energy.",
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532712938736-6e171cb2a98b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?q=80&w=2070&auto=format&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1532712938736-6e171cb2a98b?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'Un elopement intim și spectaculos, sus în vârfurile înzăpezite ale Alpilor Elvețieni. Aerul tăios și priveliștile montane dramatice au făcut fiecare cadru să pară monumental.',
    descriptionEn: 'A breathtaking, intimate elopement high in the snowy peaks of the Swiss Alps. The crisp air and dramatic mountain views made every frame feel epic and monumental.',
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2938&auto=format&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'Nuanțe calde de deșert și un stil minimalist au adus o notă boemă, modernă acestei celebrări sub cerul vast și deschis din Joshua Tree.',
    descriptionEn: 'Warm desert hues and minimalist styling brought a unique, modern bohemian vibe to this celebration under the vast open skies of Joshua Tree.',
    gallery: [
      'https://images.unsplash.com/photo-1532712938736-6e171cb2a98b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518118014377-ceac5b906f0e?q=80&w=2070&auto=format&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'Jurăminte pe stâncile de deasupra Mării Tireniene. Culorile vibrante ale Coastei Amalfi s-au împletit perfect cu estetica pasională și vie a cuplului.',
    descriptionEn: "Cliffside vows overlooking the Tyrrhenian Sea. The vibrant colors of the Amalfi Coast blended seamlessly with the couple's passionate, lively aesthetic.",
    gallery: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2938&auto=format&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1518118014377-ceac5b906f0e?q=80&w=2070&auto=format&fit=crop',
    descriptionRo: 'O petrecere elegantă și modernă într-un loft din Manhattan. Skyline-ul orașului a oferit un contrast arhitectural dramatic pentru romantismul delicat al serii.',
    descriptionEn: 'A sleek, modern affair in a Manhattan loft. The city skyline offered a dramatic, architectural contrast to the delicate romance of the evening.',
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop',
    ],
    featured: true,
    sortOrder: 5,
  },
];
