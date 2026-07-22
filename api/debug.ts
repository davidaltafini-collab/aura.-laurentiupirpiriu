import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from './_lib/types.js';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Același folder și aceeași logică de semnare ca api/cloudinary-sign.ts, ca
// testul să reproducă exact ce face funcția reală de upload.
const CLOUDINARY_FOLDER = 'captur/projects';

// PNG transparent 1x1, ca payload de test pentru upload-ul Cloudinary.
const TEST_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Endpoint TEMPORAR de diagnostic. Testează fiecare verigă separat, ca să se
 * vadă exact unde se rupe lanțul: funcții deployate -> variabile de mediu ->
 * conexiune Supabase -> drept de scriere -> SMTP -> Cloudinary.
 *
 * SECURITATE: nu întoarce NICIODATĂ valoarea unei variabile secrete, doar dacă
 * există și câte caractere are. Accesul e limitat de token-ul de mai jos.
 * ȘTERGE acest fișier după ce terminăm depanarea.
 *
 * Utilizare:  /api/debug?key=captur-diag-7f3k9x2m
 */
const DIAG_TOKEN = 'captur-diag-7f3k9x2m';

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

  // ── 4. Cloudinary: upload REAL de test ───────────────────────────────────
  // Reproduce exact ce face api/cloudinary-sign.ts + upload-ul din browser, dar
  // fără veriga de token Supabase. Astfel:
  //   - dacă merge AICI dar upload-ul din admin eșuează -> problema e la
  //     verificarea token-ului (supabase.auth.getUser) din cloudinary-sign;
  //   - dacă eșuează AICI -> problema e la credențialele/semnătura Cloudinary.
  const cloud: Record<string, unknown> = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? null,
    apiKeySet: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretSet: Boolean(process.env.CLOUDINARY_API_SECRET),
  };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    cloud.testUpload = { skipped: 'Lipsesc variabile Cloudinary.' };
    report.ok = false;
  } else {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}`;
      const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

      const form = new FormData();
      form.append('file', `data:image/png;base64,${TEST_PNG_BASE64}`);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', CLOUDINARY_FOLDER);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const uploadRes = await withTimeout(
        fetch(endpoint, { method: 'POST', body: form }),
        12000,
        'upload Cloudinary',
      );
      const uploadBody = await uploadRes.json().catch(() => ({}));

      // Detaliile exacte de cerere + răspuns, ca să le putem da asistentului
      // Cloudinary. api_key NU e secret (se trimite în fiecare upload din
      // browser), deci poate fi arătat ca să identifice cheia. Secretul NU apare.
      cloud.requestDetails = {
        method: 'POST multipart/form-data',
        endpoint,
        signedMode: true,
        apiKeyUsed: apiKey,
        stringThatWasSigned: paramsToSign,
        fieldsSent: ['file', 'api_key', 'timestamp', 'signature', 'folder'],
        folder: CLOUDINARY_FOLDER,
      };
      cloud.responseHeaders = {
        xCldError: uploadRes.headers.get('x-cld-error'),
      };

      if (!uploadRes.ok) {
        cloud.testUpload = {
          ok: false,
          status: uploadRes.status,
          error: uploadBody?.error?.message ?? 'necunoscut',
        };
        report.ok = false;
      } else {
        cloud.testUpload = { ok: true, publicId: uploadBody.public_id };
        // Ștergem imaginea de test (destroy cere semnătură pe public_id+timestamp).
        try {
          const ts2 = Math.round(Date.now() / 1000);
          const destroySig = crypto
            .createHash('sha1')
            .update(`public_id=${uploadBody.public_id}&timestamp=${ts2}${apiSecret}`)
            .digest('hex');
          const df = new FormData();
          df.append('public_id', uploadBody.public_id);
          df.append('api_key', apiKey);
          df.append('timestamp', String(ts2));
          df.append('signature', destroySig);
          const destroyRes = await withTimeout(
            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body: df }),
            12000,
            'destroy Cloudinary',
          );
          const destroyBody = await destroyRes.json().catch(() => ({}));
          cloud.testCleanup = { ok: destroyBody.result === 'ok', result: destroyBody.result };
        } catch (err) {
          cloud.testCleanup = { ok: false, error: describe(err) };
        }
      }
    } catch (err) {
      cloud.testUpload = { ok: false, fatal: describe(err) };
      report.ok = false;
    }
  }
  report.cloudinary = cloud;

  return res.status(200).json(report);
}
