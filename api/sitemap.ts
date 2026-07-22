import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

const STATIC_PATHS = ['/', '/about', '/archive'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host;
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  let projectSlugs: string[] = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('projects').select('slug');
    projectSlugs = (data ?? []).map(row => row.slug as string);
  } catch (err) {
    console.error('[api/sitemap] Nu am putut citi proiectele din Supabase:', err);
  }

  const englishPaths = [...STATIC_PATHS, ...projectSlugs.map(slug => `/project/${slug}`)];
  const romanianPaths = englishPaths.map(path => (path === '/' ? '/ro' : `/ro${path}`));
  const paths = [...englishPaths, ...romanianPaths];

  const urls = paths
    .map(path => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
}
