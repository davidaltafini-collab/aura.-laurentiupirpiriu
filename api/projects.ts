import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

interface ProjectRow {
  id: string;
  slug: string;
  title_ro: string;
  title_en: string;
  location: string;
  event_date: string;
  cover_image_url: string;
  gallery_image_urls: string[];
  description_ro: string;
  description_en: string;
  featured: boolean;
  sort_order: number;
}

function rowToProject(row: ProjectRow) {
  return {
    id: row.id,
    slug: row.slug,
    titleRo: row.title_ro,
    titleEn: row.title_en,
    location: row.location,
    date: row.event_date,
    coverImage: row.cover_image_url,
    gallery: row.gallery_image_urls ?? [],
    descriptionRo: row.description_ro,
    descriptionEn: row.description_en,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[api/projects] Eroare Supabase:', error.message);
      return res.status(500).json({ error: 'Nu am putut citi proiectele.' });
    }

    const projects = (data ?? []) as ProjectRow[];
    return res.status(200).json({ projects: projects.map(rowToProject) });
  } catch (err) {
    console.error('[api/projects] Eroare neasteptata:', err);
    return res.status(500).json({ error: 'A aparut o eroare neasteptata.' });
  }
}
