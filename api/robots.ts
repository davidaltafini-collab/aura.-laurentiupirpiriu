import type { VercelRequest, VercelResponse } from './_lib/types.js';

// Generated dynamically so the sitemap URL always uses the current domain.
export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host;
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(body);
}
