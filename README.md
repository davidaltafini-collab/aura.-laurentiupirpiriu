# CAPTUR. — Wedding & Drone Cinematography

Site-ul lui Laurentiu Pirpiriu: portofoliu foto/video, formular de contact real,
panou de administrare, SEO + GEO. React 19 + TypeScript + Vite + Tailwind v4 +
Supabase (bază de date, autentificare, storage poze) + funcții serverless Vercel.

## Rulare locală

**Cerințe:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # completează valorile — vezi DEPLOY.md
npm run dev
```

Fără `.env.local` completat, site-ul rulează cu datele placeholder locale din
`src/data.ts` (fără backend real — login, formular și admin nu vor funcționa).

## Documente importante

- [`progress.md`](progress.md) — stadiul curent al proiectului, ce mai e de făcut, ce trebuie făcut de client
- [`DEPLOY.md`](DEPLOY.md) — ghid pas-cu-pas pentru Supabase, Vercel, email, lansare
- [`MIGRATION.md`](MIGRATION.md) — cum treci de pe infrastructura ta temporară pe cea finală a clientului (domeniu + ownership), fără pierdere de date
- [`supabase/schema.sql`](supabase/schema.sql) — schema bazei de date (rulează o singură dată în Supabase)

## Scripturi

- `npm run dev` — server de dezvoltare
- `npm run build` — build de producție (`dist/`)
- `npm run lint` — verificare TypeScript (`tsc --noEmit`)
