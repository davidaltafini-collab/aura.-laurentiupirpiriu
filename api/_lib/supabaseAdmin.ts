import { createClient } from '@supabase/supabase-js';

// Folosit DOAR în funcțiile serverless (api/*). Cheia service_role ocolește
// RLS — nu trebuie niciodată importată în cod care ajunge în bundle-ul de
// browser (de-asta trăiește sub api/_lib, nu sub src/).
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Lipsesc VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY din variabilele de mediu Vercel.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
