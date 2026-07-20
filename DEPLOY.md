# Ghid de lansare — Aura (Laurentiu Pirpiriu Photography)

Acest ghid te duce de la codul din acest repo până la site live, gratuit, pe un
subdomeniu Vercel. Toți pașii de mai jos se fac o singură dată.

> Folosește pentru conturile de mai jos (Supabase, Vercel, Cloudinary) un email
> de pe domeniul tău propriu, NU emailul tău personal și NU un Gmail nou creat
> pe loc — așa nu-ți încarci contul personal cu proiecte de clienți. Mai târziu,
> când cădeți de acord cu Laurentiu pe domeniul final, urmezi
> [`MIGRATION.md`](MIGRATION.md) ca să treci totul pe infrastructura clientului.

---

## 1. Creează proiectul Supabase (bază de date + autentificare)

1. Mergi pe [supabase.com](https://supabase.com) → creează cont gratuit → **New Project**.
2. Alege un nume (ex. `aura-photography`) și o parolă pentru baza de date (salveaz-o undeva sigur).
3. După ce proiectul e gata: **SQL Editor** → **New query** → copiază tot conținutul din
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
4. Opțional, dacă vrei site-ul populat din start cu proiectele placeholder (ca să arate
   identic cu ce vezi local): rulează și [`supabase/seed.sql`](supabase/seed.sql) la fel.
5. Creează contul de admin al lui Laurentiu: **Authentication** → **Users** → **Add user**
   → pune emailul și parola cu care se va loga în `/login`. Ține minte aceste date — sunt
   singurele credențiale de acces la panoul de administrare.
6. Ia cheile: **Project Settings** → **API**:
   - `Project URL` → va deveni `VITE_SUPABASE_URL`
   - `anon public` key → va deveni `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → va deveni `SUPABASE_SERVICE_ROLE_KEY` (**secretă**, nu o pune
     niciodată într-un fișier care ajunge pe GitHub sau în codul de front-end)

## 2. Creează contul Cloudinary (stocare + optimizare poze)

Pozele proiectelor (copertă + galerie) se încarcă din `/admin` direct în Cloudinary —
optimizare automată de imagine (resize, WebP, CDN), tier gratuit generos.

1. Mergi pe [cloudinary.com](https://cloudinary.com) → creează cont gratuit.
2. Din **Dashboard**, ia cele 3 valori (Cloud Name, API Key, API Secret):
   - `Cloud Name` → `CLOUDINARY_CLOUD_NAME`
   - `API Key` → `CLOUDINARY_API_KEY`
   - `API Secret` → `CLOUDINARY_API_SECRET` (**secretă** — nu o pune în cod/GitHub)
3. Nu trebuie configurat niciun "upload preset" — upload-ul e semnat server-side
   (`api/cloudinary-sign.ts`), verifică singur că doar adminul autentificat poate
   încărca poze.

## 3. Creează un cont Gmail dedicat pentru trimiterea emailurilor

Formularul de contact trimite două emailuri automat: unul de confirmare către persoana
care completează formularul, unul de notificare către Laurentiu.

1. Creează un cont Gmail nou (ex. `contact.aura.photography@gmail.com`) — sau, dacă
   domeniul tău are deja SMTP activ, poți folosi o adresă de acolo în loc de Gmail
   (schimbă doar `EMAIL_HOST`/`EMAIL_PORT` corespunzător providerului tău).
2. Activează verificarea în 2 pași: **Google Account → Security → 2-Step Verification**.
3. Generează o „App Password": **Security → 2-Step Verification → App passwords** →
   alege „Mail" → copiază parola generată (16 caractere). Aceasta e `EMAIL_PASS`, NU
   parola normală de Gmail.
4. Notează adresa de email a lui Laurentiu (cea reală, unde vrea să primească
   notificările de cereri noi) — asta va fi `ADMIN_NOTIFICATION_EMAIL`.

> **Mai târziu**, când domeniul final (`aura.ro`) e gata și configurați Zoho Mail:
> schimbați doar `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS` în Vercel cu
> datele Zoho (`smtp.zoho.com`, port 465) — codul nu se schimbă deloc.

## 4. Creează proiectul pe Vercel

1. Mergi pe [vercel.com](https://vercel.com) → creează cont gratuit (Hobby).
2. **Add New → Project**. Ai două variante:
   - **Cu GitHub** (recomandat): urcă acest repo pe un cont GitHub, apoi importă-l în Vercel.
   - **Fără GitHub**: instalează `npm i -g vercel`, rulează `vercel` din acest folder și
     urmează pașii interactivi.
3. Vercel detectează automat Vite (build command `npm run build`, output `dist`) — nu
   trebuie schimbat nimic, `vercel.json` din repo se ocupă de restul.

## 5. Variabilele de mediu în Vercel

**Project Settings → Environment Variables** — adaugă exact acestea (vezi și
[`.env.example`](.env.example) pentru referință):

| Variabilă | Valoare |
|---|---|
| `VITE_SUPABASE_URL` | din pasul 1 |
| `VITE_SUPABASE_ANON_KEY` | din pasul 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | din pasul 1 (secretă) |
| `CLOUDINARY_CLOUD_NAME` | din pasul 2 |
| `CLOUDINARY_API_KEY` | din pasul 2 |
| `CLOUDINARY_API_SECRET` | din pasul 2 (secretă) |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `465` |
| `EMAIL_USER` | contul din pasul 3 |
| `EMAIL_PASS` | App Password-ul din pasul 3 |
| `ADMIN_NOTIFICATION_EMAIL` | emailul real al lui Laurentiu |

După ce le adaugi, fă un redeploy (**Deployments → ⋯ → Redeploy**) ca funcțiile
serverless să vadă noile variabile.

## 6. Testează site-ul live

- Deschide URL-ul `*.vercel.app` primit de la Vercel.
- Verifică toate paginile: `/`, `/about`, `/archive`, `/project/...`, și versiunile `/en/...`.
- Completează formularul de contact cu o adresă reală de email a ta — verifică:
  - că ai primit emailul de confirmare
  - că `ADMIN_NOTIFICATION_EMAIL` a primit notificarea
  - că cererea apare în tab-ul „Cereri" din `/admin`
- Loghează-te în `/login` cu contul de admin creat la pasul 1.5, adaugă un proiect
  de test, încarcă o poză (verifică că apare și în Cloudinary Media Library, în folderul
  `aura/projects`), verifică că apare pe site.
- Verifică `/sitemap.xml` și `/robots.txt` — trebuie să răspundă cu domeniul corect.

## 7. Predare către client (Laurentiu)

- Dă-i lui Laurentiu emailul + parola de admin (create la pasul 1.5) și link-ul `/login`.
- Explică-i fluxul: proiecte noi + poze se adaugă din `/admin`, cererile de pe site
  apar în tab-ul „Cereri", modificările apar live pe site imediat (nu trebuie „publicate").
- Amintește-i că fotografiile și textele curente sunt **placeholder** (poze Unsplash) —
  trebuie înlocuite cu conținutul real cât mai curând, atât pentru imagine profesională
  cât și pentru ca SEO-ul să prindă conținut real, nu generic.

## 8. Când sunteți gata cu domeniul final

Vezi [`MIGRATION.md`](MIGRATION.md) pentru pașii compleți de migrare (transfer de
ownership Supabase + Vercel, fără pierdere de date). Pe scurt:

1. Cumpărați domeniul (ex. `aura.ro`).
2. Vercel → **Project Settings → Domains** → adaugă domeniul, urmează instrucțiunile DNS.
3. Configurați Zoho Mail pe domeniu (`admin@aura.ro`) — vezi nota din pasul 3.
4. Actualizați `BUSINESS.telephone` și `BUSINESS.sameAs` din
   [`src/lib/seoSchemas.ts`](src/lib/seoSchemas.ts) cu datele reale.
5. Recomandat: creați și verificați un Google Business Profile pentru „Aura" — cel mai
   puternic semnal pentru SEO local, dar necesită verificare externă (poștă/telefon),
   nu se poate face din cod.
