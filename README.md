# Planer Podróży (Travel Planner)

Spersonalizowany plan podróży: kierunek, dni, styl → plan z mapą, budżetem, checklistą i współpracą grupową.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma 7** + PostgreSQL
- **TanStack Query**, **Zustand**, **Zod**
- **NextAuth (Auth.js)** — Faza 5
- **@dnd-kit** — edycja planu (Faza 4)

## Szybki start

```bash
# 1. Zależności (już po npm install)
npm install

# 2. Skopiuj zmienne środowiskowe
cp .env.example .env
# Uzupełnij DATABASE_URL (Neon / Supabase / lokalny Postgres)

# 3. Migracja bazy
npm run db:migrate

# 4. Dev server
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)  
Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Struktura projektu

```
src/
  app/              # Strony i API routes
  components/
    layout/         # Header, footer
    ui/             # shadcn
  generated/prisma/ # Klient Prisma (generowany)
  lib/              # db, env, auth
  providers/        # React Query, toasty
  stores/           # Zustand (kreator)
  types/            # Zod + typy domenowe
prisma/
  schema.prisma     # Model danych
```

## Roadmapa

| Faza | Zakres | Status |
|------|--------|--------|
| 0 | Szkielet, DB schema, landing | ✅ |
| 1 | Kreator + generowanie AI | 🔜 |
| 2 | Mapa, trasa, budżet | |
| 3 | Pogoda, checklist, PDF | |
| 4 | Edycja drag-and-drop | |
| 5 | Auth, moje plany | |
| 6 | Share, głosowanie, koszty | |
| 7 | Cache, rate limit, testy | |

## Przydatne komendy

```bash
npm run dev          # serwer deweloperski
npm run build        # build produkcyjny
npm run db:studio    # Prisma Studio
npm run lint         # ESLint
```
