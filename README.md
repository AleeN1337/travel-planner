# Planer Podróży (Travel Planner)

Spersonalizowany plan podróży: kierunek, dni, styl → plan z mapą, budżetem, checklistą i współpracą grupową.

**Repo:** https://github.com/AleeN1337/travel-planner

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma 7** + PostgreSQL (Neon)
- **OpenAI** — generowanie planu
- **Mapbox** — mapa i trasy
- **NextAuth (Auth.js)** — Google OAuth
- **@dnd-kit** — edycja planu

## Szybki start (lokalnie)

```bash
npm install
cp .env.example .env
# Uzupełnij DATABASE_URL, OPENAI_API_KEY, AUTH_*, MAPBOX, opcjonalnie OPENWEATHER

npm run db:push    # lub: npm run db:migrate
npm run dev
```

- Aplikacja: http://localhost:3000  
- Health: http://localhost:3000/api/health  

## Wdrożenie (Vercel + Neon — darmowo)

Szczegóły krok po kroku: **[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)**

1. Baza **Neon** → `DATABASE_URL` → `npx prisma db push`
2. Import repozytorium na **Vercel**
3. Ustaw zmienne z `.env.example` (szczególnie `AUTH_URL` = URL produkcyjny)
4. Google OAuth: redirect URI na domenę Vercel

## Struktura projektu

```
src/
  app/              # Strony i API
  components/       # UI, plan, wizard, auth
  generated/prisma/
  lib/              # db, AI, mapy, pogoda, PDF
prisma/schema.prisma
```

## Roadmapa

| Faza | Zakres | Status |
|------|--------|--------|
| 0 | Szkielet, DB, landing | ✅ |
| 1 | Kreator + AI | ✅ |
| 2 | Mapa, trasa, budżet | ✅ |
| 3 | Pogoda, checklista, PDF | ✅ |
| 4 | Edycja drag-and-drop | ✅ |
| 5 | Auth Google, moje plany | ✅ |
| 6 | Share, głosowanie, koszty | 🔜 |
| 7 | Cache Redis, rate limit, testy | 🔜 |

## Komendy

```bash
npm run dev          # dev server
npm run build        # build produkcyjny
npm run db:push      # synchronizacja schematu z DB
npm run db:studio    # Prisma Studio
npm run lint
```
