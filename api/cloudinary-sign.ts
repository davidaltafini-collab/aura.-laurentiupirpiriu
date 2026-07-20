import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from './_lib/types';
import { getSupabaseAdmin } from './_lib/supabaseAdmin';

const UPLOAD_FOLDER = 'aura/projects';

// Generează o semnătură de upload Cloudinary time-limited, doar pentru
// utilizatori autentificați (verificați prin token-ul Supabase) — cheia
// secretă Cloudinary rămâne server-side, browserul primește doar semnătura.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Neautorizat.' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return res.status(401).json({ error: 'Neautorizat.' });
    }
  } catch (err) {
    console.error('[api/cloudinary-sign] Eroare la verificarea token-ului:', err);
    return res.status(401).json({ error: 'Neautorizat.' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary nu e configurat pe server.' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${UPLOAD_FOLDER}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  return res.status(200).json({ signature, timestamp, apiKey, cloudName, folder: UPLOAD_FOLDER });
}
