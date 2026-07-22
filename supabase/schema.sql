-- Schema Supabase pentru site-ul CAPTUR. (Laurentiu Pirpiliu Photography)
--
-- CUM SE RULEAZĂ:
-- 1. Creează un proiect gratuit pe https://supabase.com
-- 2. Deschide proiectul -> SQL Editor -> New query
-- 3. Copiază tot conținutul acestui fișier, rulează-l (Run)
-- 4. Creează un utilizator admin: Authentication -> Users -> Add user
--    (folosește emailul + parola cu care Laurentiu se va loga în /login)
-- 5. Ia din Project Settings -> API: "Project URL" și "anon public" key
--    -> pune-le în .env.local ca VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
--    Ia și "service_role" key (secret!) -> merge în Vercel ca SUPABASE_SERVICE_ROLE_KEY
--    (NICIODATĂ cu prefix VITE_, ca să nu ajungă în codul trimis către browser)

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────
-- Tabel: projects (portofoliul de lucrări)
-- ─────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ro text not null,
  title_en text not null,
  location text not null default '',
  event_date text not null default '',
  cover_image_url text not null default '',
  gallery_image_urls text[] not null default '{}',
  description_ro text not null default '',
  description_en text not null default '',
  featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "Public can read projects" on projects;
create policy "Public can read projects"
  on projects for select
  using (true);

drop policy if exists "Authenticated users can insert projects" on projects;
create policy "Authenticated users can insert projects"
  on projects for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update projects" on projects;
create policy "Authenticated users can update projects"
  on projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete projects" on projects;
create policy "Authenticated users can delete projects"
  on projects for delete
  to authenticated
  using (true);

-- ─────────────────────────────────────────────
-- Tabel: leads (cererile primite din formularul de contact)
-- ─────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text,
  event_type text,
  event_date text,
  locale text,
  source_page text,
  -- „Trimite o poză" din footer: kind='photo', image_url = poza din Cloudinary,
  -- ip_hash = sha256 al IP-ului pentru rate-limit anti-bot (vezi migration_2).
  image_url text,
  ip_hash text,
  kind text not null default 'contact',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists leads_photo_ratelimit_idx
  on leads (ip_hash, kind, created_at);

alter table leads enable row level security;

-- Fără politică de INSERT public: lead-urile se scriu doar din funcția
-- serverless /api/contact, care folosește service_role key (ocolește RLS).
-- Așa nu poate nimeni să trimită lead-uri direct din consola browserului.

drop policy if exists "Authenticated users can read leads" on leads;
create policy "Authenticated users can read leads"
  on leads for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update leads" on leads;
create policy "Authenticated users can update leads"
  on leads for update
  to authenticated
  using (true)
  with check (true);

-- Notă: pozele proiectelor NU se mai stochează în Supabase Storage — se
-- încarcă direct în Cloudinary (vezi api/cloudinary-sign.ts și
-- src/lib/cloudinary.ts). Doar URL-ul rezultat (cover_image_url,
-- gallery_image_urls) se salvează în tabela `projects` de mai sus.
