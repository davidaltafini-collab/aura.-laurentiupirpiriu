import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * Endpoint TEMPORAR de diagnostic. Testează fiecare verigă separat, ca să se
 * vadă exact unde se rupe lanțul: funcții deployate -> variabile de mediu ->
 * conexiune Supabase -> drept de scriere -> SMTP -> Cloudinary.
 *
 * SECURITATE: nu întoarce NICIODATĂ valoarea unei variabile secrete, doar dacă
 * există și câte caractere are. Accesul e limitat de token-ul de mai jos.
 * ȘTERGE acest fișier după ce terminăm depanarea.
 *
 * Utilizare:  /api/debug?key=aura-diag-7f3k9x2m
 */
const DIAG_TOKEN = 'aura-diag-7f3k9x2m';

// Variabilele publice (ajung oricum în bundle-ul de browser) le putem arăta
// întregi; restul, doar ca prezență + lungime.
const PUBLIC_VARS = ['VITE_SUPABASE_URL'];

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'ADMIN_NOTIFICATION_EMAIL',
];

// PromiseLike, nu Promise: constructorul de interogări Supabase e un „thenable",
// nu o promisiune completă (nu are .catch/.finally), deci trebuie normalizat.
function withTimeout<T>(work: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(work),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}: timeout după ${ms}ms`)), ms),
    ),
  ]);
}

function describe(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.key !== DIAG_TOKEN) {
    return res.status(404).json({ error: 'Not found' });
  }

  const report: Record<string, unknown> = {
    ok: true,
    runtime: {
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV ?? '(nesetat — probabil nu rulează pe Vercel)',
      region: process.env.VERCEL_REGION ?? null,
    },
  };

  // ── 1. Variabile de mediu ────────────────────────────────────────────────
  const env: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const name of REQUIRED_VARS) {
    const value = process.env[name];
    if (!value) {
      missing.push(name);
      env[name] = { set: false };
    } else if (PUBLIC_VARS.includes(name)) {
      env[name] = { set: true, value };
    } else {
      env[name] = { set: true, length: value.length };
    }
  }
  report.envVars = env;
  report.envMissing = missing;
  if (missing.length > 0) report.ok = false;

  // ── 2. Supabase: conexiune, citire, scriere ──────────────────────────────
  const supabaseCheck: Record<string, unknown> = {};
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    supabaseCheck.skipped = 'Lipsesc VITE_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY.';
    report.ok = false;
  } else {
    try {
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Citire din projects
      const projectsRead = await withTimeout(
        supabase.from('projects').select('id').limit(1),
        8000,
        'citire projects',
      );
      supabaseCheck.readProjects = projectsRead.error
        ? { ok: false, error: projectsRead.error.message, code: projectsRead.error.code }
        : { ok: true, rows: projectsRead.data?.length ?? 0 };

      // Citire din leads
      const leadsRead = await withTimeout(
        supabase.from('leads').select('id').limit(1),
        8000,
        'citire leads',
      );
      supabaseCheck.readLeads = leadsRead.error
        ? { ok: false, error: leadsRead.error.message, code: leadsRead.error.code }
        : { ok: true, rows: leadsRead.data?.length ?? 0 };

      // Scriere de probă în leads — exact operația care eșuează la formular.
      // Rândul e șters imediat după.
      const probeEmail = `diagnostic-${Date.now()}@example.invalid`;
      const insert = await withTimeout(
        supabase
          .from('leads')
          .insert({
            name: 'DIAGNOSTIC — se șterge automat',
            email: probeEmail,
            message: 'Rând de test creat de /api/debug.',
          })
          .select('id'),
        8000,
        'scriere leads',
      );

      if (insert.error) {
        supabaseCheck.writeLeads = { ok: false, error: insert.error.message, code: insert.error.code, hint: insert.error.hint };
        report.ok = false;
      } else {
        const insertedId = insert.data?.[0]?.id;
        supabaseCheck.writeLeads = { ok: true, insertedId };
        if (insertedId) {
          const cleanup = await supabase.from('leads').delete().eq('id', insertedId);
          supabaseCheck.cleanup = cleanup.error ? { ok: false, error: cleanup.error.message } : { ok: true };
        }
      }
    } catch (err) {
      supabaseCheck.fatal = describe(err);
      report.ok = false;
    }
  }
  report.supabase = supabaseCheck;

  // ── 3. SMTP ──────────────────────────────────────────────────────────────
  const smtpCheck: Record<string, unknown> = {};
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    smtpCheck.skipped = 'Lipsesc una sau mai multe variabile EMAIL_*.';
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: Number(EMAIL_PORT) === 465,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });
      await withTimeout(transporter.verify(), 10000, 'verificare SMTP');
      smtpCheck.ok = true;
    } catch (err) {
      // Emailul eșuat NU blochează salvarea lead-ului (vezi api/contact.ts),
      // deci nu marchează raportul ca nereușit — dar merită știut.
      smtpCheck.ok = false;
      smtpCheck.error = describe(err);
    }
  }
  report.smtp = smtpCheck;

  // ── 4. Cloudinary ────────────────────────────────────────────────────────
  report.cloudinary = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? null,
    apiKeySet: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretSet: Boolean(process.env.CLOUDINARY_API_SECRET),
  };

  return res.status(200).json(report);
}
