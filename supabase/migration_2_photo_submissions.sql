-- Migrare: „Trimite o poză" din footer.
--
-- Vizitatorii pot trimite o poză (+ email + mesaj), care ajunge în aceeași
-- listă „Cereri" din admin. Se rulează o singură dată în Supabase:
-- SQL Editor -> New query -> lipește tot -> Run.

-- Poza urcată în Cloudinary (doar URL-ul, ca la proiecte).
alter table leads add column if not exists image_url text;

-- Hash de IP (sha256), pentru rate-limit anti-bot. Nu stocăm IP-ul brut.
alter table leads add column if not exists ip_hash text;

-- Distinge o cerere de contact ('contact') de o poză trimisă ('photo').
alter table leads add column if not exists kind text not null default 'contact';

-- Index pentru verificarea rapidă a rate-limit-ului (o poză per IP / interval).
create index if not exists leads_photo_ratelimit_idx
  on leads (ip_hash, kind, created_at);
