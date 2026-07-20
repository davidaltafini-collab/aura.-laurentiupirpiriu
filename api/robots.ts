import type { VercelRequest, VercelResponse } from './_lib/types';

// Generat dinamic (nu fișier static) ca link-ul către sitemap.xml să aibă
// mereu domeniul corect, indiferent dacă rulează pe *.vercel.app sau pe
// domeniul final — nu mai trebuie editat manual după fiecare schimbare.
export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host;
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  const body = `User-agent: *
Allow: /

# Crawlere pentru motoare AI / GEO — permise explicit ca site-ul sa poata fi
# citat de ChatGPT, Claude, Perplexity, Google AI Overviews etc.
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(body);
}
