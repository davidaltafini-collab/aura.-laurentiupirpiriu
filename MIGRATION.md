# Ghid de migrare — de la infrastructura ta temporară la cea finală

Context: acum site-ul rulează pe conturi Supabase/Vercel/Cloudinary create cu
emailul tău (domeniul tău propriu), ca să poți construi și testa fără să aștepți
după client. Când tu și Laurentiu cădeți de acord pe domeniul final (ex.
`aura.ro`) și pe cine deține infrastructura, urmează pașii de mai jos.

**Recomandare**: folosește **transfer de proprietate** (Supabase + Vercel permit
asta nativ), NU recreare de la zero — păstrezi toate datele (proiecte, cereri
primite) fără nicio migrare manuală de date. Cloudinary e excepția — vezi pasul 3.

---

## Varianta recomandată: transfer de ownership (fără pierdere de date)

### 1. Supabase — transferă proiectul
1. Clientul (sau contul final care va deține site-ul) își creează o **Organizație**
   nouă în Supabase (gratuit).
2. Din contul tău: **Project Settings → General → Transfer Project** → alege
   organizația de destinație. Trebuie să fii membru în ambele organizații pentru
   ca opțiunea să apară (te adaugă clientul ca membru temporar în organizația lui,
   sau invers).
3. După transfer: URL-ul proiectului (`VITE_SUPABASE_URL`) și cheile
   (`VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) **rămân aceleași** —
   nu trebuie schimbat nimic în cod sau în variabilele de mediu Vercel.
4. Dacă opțiunea de transfer nu apare (poate necesita ca ambele organizații să nu
   fie pe planuri incompatibile) → vezi „Varianta de rezervă" mai jos.

### 2. Vercel — transferă proiectul
1. Clientul își creează cont Vercel (sau un Team nou).
2. Din contul tău: **Project Settings → General → Transfer Project** → introdu
   contul/echipa de destinație, confirmă.
3. Verifică după transfer: **Environment Variables** — de obicei se păstrează,
   dar verifică manual că toate din `.env.example` sunt încă acolo (uneori
   platformele nu transferă valorile marcate „sensitive"/secrete — dacă lipsesc,
   repune-le manual din notițele din pasul de deploy inițial).
4. Dacă site-ul e conectat la un repo GitHub al tău: fie transferi și repo-ul
   (**GitHub → Settings → Transfer ownership**), fie dai clientului acces de
   colaborator, fie faci un `git remote` nou către un repo al clientului și
   reconectezi proiectul Vercel la noul remote.

### 3. Cloudinary — nu are transfer de ownership nativ
Spre deosebire de Supabase/Vercel, Cloudinary nu are un buton de „transfer cont"
către alt owner. Două opțiuni:
- **Cel mai simplu**: lași contul Cloudinary pe numele tău pe termen lung — e pe
  tier gratuit, fără risc de facturare, și complet transparent pentru vizitatori
  (doar tu/Laurentiu știți că imaginile sunt găzduite acolo). Mulți developeri
  fac exact asta pentru clienți mici — nu e nimic neprofesionist în asta, atâta
  timp cât clientul știe.
- **Dacă clientul insistă pe independență completă**: creează un cont Cloudinary
  nou pe numele lui, ia noile `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`,
  actualizează-le în Vercel — dar pozele deja urcate NU se mută automat. Trebuie
  să descarci fiecare poză din Cloudinary Media Library (folderul `aura/projects`)
  și să o reîncarci din `/admin` (cel mai simplu: șterge și reîncarcă din nou,
  proiect cu proiect, odată ce portofoliul final e stabil).

### 4. Domeniul propriu
1. Cumpărați `aura.ro` (sau domeniul ales).
2. În contul Vercel final: **Project Settings → Domains** → adaugă domeniul,
   configurează DNS-ul conform instrucțiunilor afișate (de obicei un record `A`
   sau `CNAME` la registrar).
3. Actualizează `public/llms.txt` dacă vrei să menționezi domeniul explicit
   (opțional — restul fișierelor, `robots.txt`/`sitemap.xml`, sunt deja dinamice
   și se adaptează automat la orice domeniu).

### 5. Email — trecerea la Zoho Mail
1. Configurați Zoho Mail pe domeniul nou (`admin@aura.ro`) — vezi pasul 3 din
   `DEPLOY.md` pentru ideea generală, doar că acum cu domeniu propriu în loc de
   Gmail.
2. În Vercel, schimbă doar variabilele de mediu:
   - `EMAIL_HOST` → `smtp.zoho.com`
   - `EMAIL_PORT` → `465`
   - `EMAIL_USER` → `admin@aura.ro`
   - `EMAIL_PASS` → parola/App Password de Zoho
3. Redeploy (**Deployments → ⋯ → Redeploy**) ca funcțiile serverless să vadă
   noile variabile. Codul nu se schimbă deloc — vezi `api/_lib/mailer.ts`.

---

## Varianta de rezervă: recreare manuală (doar dacă transferul Supabase/Vercel nu e posibil)

### Supabase — proiect nou + migrare date
1. Creează un proiect Supabase nou, în organizația/contul final.
2. Rulează `supabase/schema.sql` în SQL Editor pe proiectul nou (creează
   tabelele `projects`/`leads` + RLS identic cu cel vechi).
3. Exportă datele din proiectul vechi: **Table Editor → projects → Export → CSV**
   (la fel pentru `leads`, dacă vrei să păstrezi istoricul cererilor), sau din
   linia de comandă, dacă ai `psql`/`pg_dump` instalat:
   ```bash
   pg_dump "postgresql://postgres:[PAROLA-VECHE]@[HOST-VECHI]:5432/postgres" \
     --data-only -t public.projects -t public.leads > date_export.sql
   psql "postgresql://postgres:[PAROLA-NOUA]@[HOST-NOU]:5432/postgres" < date_export.sql
   ```
   (Găsești string-ul de conexiune în **Project Settings → Database** pe fiecare proiect.)
4. Poze: rămân neschimbate — sunt pe Cloudinary, nu în Supabase, deci nu au nevoie
   de nicio migrare aici (URL-urile din `cover_image_url`/`gallery_image_urls`
   continuă să funcționeze după export/import).
5. Creează din nou utilizatorul admin: **Authentication → Users → Add user** pe
   proiectul nou, cu aceleași date de logare.
6. Actualizează `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` în Vercel cu valorile noului proiect.

### Vercel — redeploy simplu
Nu ai nevoie de „migrare" propriu-zisă — doar importă din nou același repo
GitHub într-un cont/echipă Vercel nouă (**Add New → Project**), pui aceleași
variabile de mediu (actualizate cu noile chei Supabase/Zoho), și gata.

---

## Checklist final după migrare (orice variantă)
- [ ] Formularul de contact trimite ambele emailuri (test cu o adresă reală)
- [ ] Login admin funcționează cu contul lui Laurentiu
- [ ] Toate proiectele + pozele apar corect pe site
- [ ] Upload de poze noi din `/admin` funcționează (verifică `CLOUDINARY_*` în Vercel)
- [ ] `/sitemap.xml` și `/robots.txt` răspund cu domeniul nou
- [ ] Domeniul vechi (`*.vercel.app`, dacă a fost indexat de Google) redirecționează
      sau rămâne activ o vreme, ca să nu pierzi ce a apucat să indexeze Google
