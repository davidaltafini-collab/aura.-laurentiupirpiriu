# Progress — Aura (Laurentiu Pirpiriu Photography)

Document viu de tracking pentru implementarea backend-ului, SEO și GEO. Actualizat pe măsură ce se lucrează. Planul complet original: vezi discuția din sesiunea de plan (rezumat mai jos, la fiecare fază).

Legendă: `[ ]` de făcut · `[~]` în lucru · `[x]` gata · `[!]` blocat / are nevoie de acțiune de la tine

---

## Faza 0 — Fundație tehnică
- [x] Inițializare repo git (`.git`), `.gitignore` actualizat (exclude `.claude/`, `.impeccable/`, `.env*`, `dist/`, `node_modules/`)
- [x] `progress.md` creat
- [ ] Primul commit cu starea inițială a codului (înainte de orice modificare)
- [!] **Tu**: creezi cont Vercel (gratuit) + cont Supabase (gratuit) — vezi secțiunea "Ce trebuie să faci tu" mai jos

## Faza 1 — Backend: date, auth, formular de contact ✅ GATA
- [x] Curățare `package.json` (eliminat `express`/`dotenv`/`@google/genai` nefolosite; adăugat `@supabase/supabase-js`, `react-i18next`, `nodemailer`)
- [x] Schema SQL Supabase: `supabase/schema.sql` (tabele `projects`, `leads` + RLS + bucket `project-images`) și `supabase/seed.sql` (date placeholder)
- [x] `src/lib/supabaseClient.ts` + `src/lib/projects.ts` (CRUD) + `src/lib/leads.ts`
- [x] Auth real: `src/context/AuthContext.tsx` + `Login.tsx` cu `supabase.auth.signInWithPassword()` + `ProtectedRoute.tsx` pentru `/admin`
- [x] `useProjects.ts` migrat de la `localStorage` la Supabase (cu fallback pe datele placeholder locale dacă Supabase nu e configurat încă)
- [x] `Admin.tsx` rescris: CRUD proiecte via Supabase, upload real de poze (Cloudinary, vezi mai jos), câmpuri bilingve RO/EN, tab nou "Cereri" (leads) cu status "contactat", editare cu buton explicit "Salvează" (nu mai auto-save pe fiecare tastă)
- [x] Upload poze trecut de la Supabase Storage la **Cloudinary** (decizie ulterioară — optimizare automată de imagine): `api/cloudinary-sign.ts` generează semnătură de upload server-side (doar pentru admin autentificat, verificat prin token Supabase), `src/lib/cloudinary.ts` face upload-ul direct din browser către Cloudinary cu semnătura respectivă. Cheia API secretă Cloudinary nu ajunge niciodată în browser.
  - Notă: butonul "Publică modificările"/Deploy Hook din planul inițial NU mai e necesar — site-ul public citește proiectele live din Supabase, deci nu există build static de reîmprospătat. Rămâne relevant doar dacă se adaugă prerendering static (vezi Faza opțională de mai jos).
- [x] Formular de contact real în `Home.tsx` (componenta `ContactForm.tsx`: validare, stare loading/succes/eroare)
- [x] `api/contact.ts` — funcție serverless Vercel: salvează lead în Supabase (`api/_lib/supabaseAdmin.ts`, service role key) + trimite email de confirmare (către client) + email de notificare (către Laurentiu) prin Nodemailer/SMTP (`api/_lib/mailer.ts`)
- [x] `npx tsc --noEmit` și `npm run build` trec curat, `npm audit` = 0 vulnerabilități

## Faza 2 — SEO tehnic ✅ GATA
- [x] `index.html`: titlu real, meta description, favicon (`public/favicon.svg` — monogramă placeholder, de înlocuit cu logo real), OG/Twitter tags de bază
- [x] Componentă SEO proprie (`src/components/Seo.tsx`, fără dependențe externe — `react-helmet-async` are conflict de peer-deps cu React 19) — titlu/meta/OG/canonical/hreflang per pagină (Home, About, Archive, ProjectDetails)
- [x] JSON-LD (`src/lib/seoSchemas.ts`): `PhotographyBusiness` (homepage, cu date de business placeholder — vezi TODO din fișier), `BreadcrumbList`, `CreativeWork` (proiecte), `FAQPage`
- [x] `api/robots.ts` — generat dinamic (nu fișier static) ca să aibă mereu domeniul corect; permite explicit crawlerele AI (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended, anthropic-ai)
- [x] `public/llms.txt`
- [x] `api/sitemap.ts` — generat dinamic din proiectele din Supabase (nu necesită rebuild)
- [x] `vercel.json` — rewrites pentru `/robots.txt`, `/sitemap.xml` și fallback SPA
  - Notă: am renunțat la prerendering build-time (SSG) din planul inițial — vezi Faza opțională de mai jos pentru context. Meta tags-urile se setează client-side (bun pentru Google, care execută JS); pentru bots care NU execută JS (unele crawlere AI, preview-uri sociale) rămâne un gap cunoscut, documentat mai jos.

## Faza 3 — GEO / SEO local ✅ GATA
- [x] Secțiune „Zone deservite" (`AreasServedSection.tsx` — orașe placeholder până la lista reală de la client)
- [x] Secțiune FAQ (`FaqSection.tsx`, conținut bilingv în `src/data/faq.ts`) + schema `FAQPage`
- [x] Copy orientat spre E-E-A-T în bio (About)
- [!] **Tu**: Google Business Profile — necesită identitatea reală a afacerii (adresă, telefon), nu pot face asta din cod
- [!] **Tu**: datele de business din `src/lib/seoSchemas.ts` (`BUSINESS.telephone`, `BUSINESS.sameAs`) sunt placeholder — completează cu numărul de telefon și linkurile sociale reale înainte de lansare

## Faza 4 — i18n RO/EN ✅ GATA
- [x] `react-i18next` + fișiere `src/i18n/ro.json` / `src/i18n/en.json`
- [x] Rute `/en/...` (via `LocaleLayout.tsx` + rute imbricate în `App.tsx`), RO rămâne la rădăcină `/`
- [x] Tag-uri `hreflang` (ro/en/x-default) generate automat în `Seo.tsx` din calea curentă
- [x] `LanguageSwitcher.tsx` în footer, pe toate paginile
- [x] Conținut proiecte (titlu + descriere) bilingv, editabil din Admin (`titleRo`/`titleEn`/`descriptionRo`/`descriptionEn`)
- Notă: Admin și Login au rămas doar în română — sunt unelte interne pentru Laurentiu, nu conținut public, deci nu au nevoie de traducere.

## Decizie: prerendering / SSR pentru crawlere fără JS — AMÂNAT (documentat)
Planul inițial propunea randare statică (SSG) la build time pentru ca și crawlerele
care NU execută JavaScript (unele boți AI ca GPTBot/ClaudeBot, preview-urile
Facebook/WhatsApp) să vadă titluri/descrieri corecte per pagină, nu doar cele
generice din `index.html`.

Am evaluat două variante de implementare:
1. **SSG cu React la build time** (`react-dom/server` + `StaticRouter`) — fezabil, dar adaugă complexitate semnificativă (hidratare, sincronizare cu datele din Supabase la build).
2. **Randare dinamică doar pentru boți** (server rândește HTML minimal doar când detectează un crawler cunoscut) — mai simplă, dar ar necesita rutarea TUTUROR cererilor de pagină printr-o funcție serverless Vercel în loc de fișiere statice servite direct din CDN. Pe planul gratuit Vercel (Hobby) asta ar consuma cota de execuții serverless la fiecare vizită umană, nu doar la boți — risc real de a ieși din tier-ul gratuit, ceea ce contrazice cerința explicită „nu vreau să plătesc nimic, nici clientul".

**Decizie**: am renunțat la ambele, cel puțin în această etapă. Site-ul rămâne 100%
static (servit din CDN, gratuit, fără limite practice) + meta tags setate
client-side (`Seo.tsx`). Asta acoperă bine Google (execută JS la indexare) și
majoritatea rețelelor sociale moderne, dar boții care NU execută JS vor vedea
titlul/descrierea generice din `index.html`, nu cele specifice fiecărui proiect.
**Dacă pe viitor traficul crește și se trece pe un plan Vercel plătit**, varianta
2 devine viabilă și arhitectura actuală (Seo.tsx + seoSchemas.ts) e deja pregătită
să fie reutilizată pentru asta.

## Faza 5 — Performanță & polish
- [x] Lazy loading imagini (except hero) — `loading="lazy"` pe imaginile din grile/galerii
- [x] Consistență branding: „Aura" (comercial) + Laurentiu Pirpiriu (fotograful) — aplicat în schema.org, meta tags, copy About
- [x] Code-splitting: `Admin`/`Login` încărcate lazy (`React.lazy` + `Suspense` în `App.tsx`) — nu mai umflă bundle-ul public cu cod folosit doar de Laurentiu
- [ ] Verificare Core Web Vitals / Lighthouse — recomand rulare după ce sunt poze reale (Unsplash-urile placeholder nu sunt reprezentative pentru performanța finală)

## Faza 6 — Deploy & handoff
- [x] `vercel.json` + `.env.example` actualizat cu variabilele reale
- [x] `DEPLOY.md` — ghid pas-cu-pas pentru tine/client: Supabase, Vercel, Gmail, variabile de mediu, admin
- [x] Testat local în browser real (Playwright): toate rutele RO/EN, switch de limbă (inclusiv păstrarea paginii curente la schimbarea limbii), formular de login, fallback pe date locale fără Supabase — 0 erori în consolă. Singurele "erori" găsite au fost 2 poze placeholder Unsplash blocate de rețeaua din mediul de test (`ERR_BLOCKED_BY_ORB`) — verificat că nu se reproduce prin `fetch()` direct, deci ține de mediul de test, nu de cod; oricum pozele alea sunt placeholder și se înlocuiesc cu conținut real.
- [ ] Deploy efectiv pe Vercel (necesită contul tău — vezi `DEPLOY.md`)
- [ ] Test end-to-end pe deploy-ul real: formular → email-uri, admin login, adăugare proiect
- [ ] Predare către client (Laurentiu): cont admin, cum adaugă proiecte, cum vede cererile

---

## Ce trebuie să faci tu (nu pot face eu automat)
- [ ] Cont Vercel (gratuit) — cu emailul tău de domeniu propriu, NU contul personal (vezi decizia de mai jos)
- [ ] Cont Supabase (gratuit) — la fel, cu emailul tău de domeniu propriu
- [ ] Cont Cloudinary (gratuit) — pentru poze; nu are transfer nativ de ownership, vezi nota din `MIGRATION.md`
- [ ] Cont Gmail dedicat (ex. `contact.aura.photography@gmail.com`) + „App Password" generat pentru trimitere automată de email-uri — sau, dacă preferi, adresa de pe domeniul tău dacă are deja SMTP activ
- [ ] Adresa de email a lui Laurentiu unde ajung notificările de cereri noi
- [ ] Conținut real: poze, bio, texte, adresă/telefon business (pentru Google Business Profile și pentru schema.org)
- [ ] Mai târziu: cumpărare domeniu final (`aura.ro` sau altul) + migrare completă către client — vezi **[`MIGRATION.md`](MIGRATION.md)**

### Decizie: infrastructură temporară pe domeniul tău, migrare la final
Ca să nu-ți încarci contul personal cu proiecte de clienți (și să nu dai peste
limita de conturi Gmail), conturile Supabase/Vercel se creează acum cu un email
de pe **domeniul tău propriu**, nu cu emailul tău personal și nu cu un Gmail nou.
Când tu și Laurentiu cădeți de acord pe domeniul final, urmezi `MIGRATION.md` —
recomand transfer de ownership (Supabase + Vercel permit asta nativ, fără
pierdere de date), cu o variantă de rezervă prin recreare manuală dacă transferul
nu e posibil din vreun motiv.

## Decizii cheie (rezumat)
- Hosting: Vercel Hobby (gratuit), fără domeniu propriu deocamdată
- Backend: Supabase (Postgres + Auth + Storage, gratuit) — fără server Express separat
- Email: Gmail SMTP acum → Zoho Mail mai târziu (doar schimbare de config, nu de cod)
- GEO: SEO local + optimizare pentru motoare AI, ambele
- Limbă: Română principal, Engleză secundar
- Brand: „Aura" (comercial) + Laurentiu Pirpiriu (fotograful din spate)
