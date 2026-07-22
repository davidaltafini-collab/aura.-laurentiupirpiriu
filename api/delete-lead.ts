import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getLeadId(req: VercelRequest) {
  const raw = req.query.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = getLeadId(req);
  if (!id || !UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Cererea nu este valida.' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Autentificare necesara.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Configurarea Supabase lipseste.' });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return res.status(401).json({ error: 'Sesiune admin invalida.' });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) {
    console.error('[api/delete-lead] Eroare Supabase:', error.message);
    return res.status(500).json({ error: 'Nu am putut sterge cererea.' });
  }

  return res.status(200).json({ ok: true });
}
