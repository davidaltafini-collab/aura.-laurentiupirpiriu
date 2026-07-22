import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';
import { uploadDataUriToCloudinary } from './_lib/cloudinaryUpload.js';
import { sendPhotoSubmissionEmail } from './_lib/mailer.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// O poză per IP la fiecare interval — anti-bot, fără să blocheze un om normal.
const RATE_LIMIT_HOURS = 1;
// Poza vine deja comprimată de client (~max 1600px). Limită de siguranță pe
// payload: ~5MB de imagine devin ~6.7M caractere base64.
const MAX_IMAGE_CHARS = 7_000_000;
const ALLOWED_IMAGE = /^data:image\/(jpeg|png|webp);base64,/;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd || '').split(',')[0];
  return first.trim() || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, email, message, sourcePage } = req.body ?? {};

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Adresa de email nu este validă.' });
  }
  if (typeof image !== 'string' || !ALLOWED_IMAGE.test(image)) {
    return res.status(400).json({ error: 'Poza lipsește sau are un format nevalid.' });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return res.status(413).json({ error: 'Poza e prea mare. Încearcă una mai mică.' });
  }

  const ipHash = crypto.createHash('sha256').update(clientIp(req)).digest('hex');

  try {
    const supabase = getSupabaseAdmin();

    // Rate-limit: dacă acest IP a mai trimis o poză în ultimele RATE_LIMIT_HOURS, refuzăm.
    const since = new Date(Date.now() - RATE_LIMIT_HOURS * 3600 * 1000).toISOString();
    const { data: recent, error: rlError } = await supabase
      .from('leads')
      .select('id')
      .eq('kind', 'photo')
      .eq('ip_hash', ipHash)
      .gte('created_at', since)
      .limit(1);
    if (rlError) {
      console.error('[api/photo-submission] Eroare la verificarea rate-limit:', rlError.message);
    } else if (recent && recent.length > 0) {
      return res.status(429).json({ error: 'Ai trimis deja o poză recent. Mai încearcă peste puțin timp.' });
    }

    const imageUrl = await uploadDataUriToCloudinary(image, 'captur/submissions');

    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
    const { error: dbError } = await supabase.from('leads').insert({
      name: 'Poză de la vizitator',
      email: email.trim().slice(0, 200),
      message: cleanMessage || null,
      image_url: imageUrl,
      ip_hash: ipHash,
      kind: 'photo',
      source_page: typeof sourcePage === 'string' ? sourcePage.slice(0, 200) : null,
    });
    if (dbError) {
      console.error('[api/photo-submission] Eroare Supabase:', dbError.message);
      return res.status(500).json({ error: 'Nu am putut salva poza. Încearcă din nou.' });
    }

    try {
      await sendPhotoSubmissionEmail({ email: email.trim(), message: cleanMessage, imageUrl });
    } catch (mailError) {
      // Poza e deja salvată și vizibilă în admin — nu blocăm vizitatorul dacă
      // emailul eșuează.
      console.error('[api/photo-submission] Poză salvată, dar emailul a eșuat:', mailError);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/photo-submission] Eroare neașteptată:', err);
    return res.status(500).json({ error: 'A apărut o eroare. Încearcă din nou.' });
  }
}
