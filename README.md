# CAPTUR. - Wedding & Drone Cinematography

Website pentru Laurentiu Pirpiliu: portofoliu foto/video, formular de contact,
panou de administrare, SEO, Supabase si functii serverless Vercel.

## Rulare Locala

**Cerinte:** Node.js 20+

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fara `.env.local` completat, site-ul ruleaza cu datele locale din `src/data.ts`.
Login-ul, formularul si admin-ul au nevoie de variabilele reale de backend.

## Documente

- [`DEPLOY.md`](DEPLOY.md) - ghid pentru Supabase, Vercel, email si lansare
- [`supabase/schema.sql`](supabase/schema.sql) - schema bazei de date

## Scripturi

- `npm run dev` - server de dezvoltare
- `npm run build` - build de productie (`dist/`)
- `npm run lint` - verificare TypeScript (`tsc --noEmit`)
