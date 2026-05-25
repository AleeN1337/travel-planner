# Wdrożenie na Vercel (darmowy plan)

## 1. Baza danych (Neon — darmowy tier)

1. Załóż projekt na [https://neon.tech](https://neon.tech)
2. Skopiuj **Connection string** (PostgreSQL, z `?sslmode=require`)
3. W Neon → **SQL Editor** lub lokalnie:

```bash
# Ustaw DATABASE_URL na connection string z Neon, potem:
npx prisma db push
```

To utworzy tabele (User, TripPlan, Auth itd.) na produkcji.

## 2. Projekt na Vercel

1. Wejdź na [https://vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → `AleeN1337/travel-planner`
3. Framework: **Next.js** (wykryje automatycznie)
4. **Environment Variables** — dodaj zmienne z `.env` (**tylko wartości**, bez nazwy i cudzysłowów):

   - Źle: `AUTH_URL="https://twoja-app.vercel.app"`
   - Dobrze: `https://twoja-app.vercel.app`

   Zaznacz **Production** i **Preview** przy każdej zmiennej.

| Zmienna | Wymagane | Uwagi |
|---------|----------|--------|
| `DATABASE_URL` | tak | Neon connection string |
| `AUTH_SECRET` | tak | `openssl rand -base64 32` |
| `AUTH_URL` | tak | `https://TWOJA-DOMENA.vercel.app` (bez slash na końcu) |
| `OPENAI_API_KEY` | tak | generowanie planów |
| `OPENAI_MODEL` | nie | domyślnie `gpt-4o-mini` |
| `AUTH_GOOGLE_ID` | dla logowania | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | dla logowania | |
| `EMAIL_SERVER` | dla rejestracji | SMTP, np. `smtp://user:pass@smtp.gmail.com:587` |
| `EMAIL_FROM` | dla rejestracji | np. `Planer Podróży <noreply@twoja-domena.pl>` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | dla mapy | token publiczny Mapbox |
| `OPENWEATHER_API_KEY` | nie | pogoda opcjonalna |

5. **Deploy**

Po pierwszym deployu skopiuj URL produkcyjny (np. `https://travel-planner-xxx.vercel.app`) i **zaktualizuj** `AUTH_URL` w Vercel → Settings → Environment Variables → Redeploy.

## 3. Google OAuth (produkcja)

W [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client:

- **Authorized JavaScript origins:** `https://TWOJA-DOMENA.vercel.app`
- **Authorized redirect URIs:** `https://TWOJA-DOMENA.vercel.app/api/auth/callback/google`

## 4. Mapbox

Token z [Mapbox](https://account.mapbox.com/access-tokens/) — ogranicz URL do domeny Vercel (opcjonalnie, ze względów bezpieczeństwa).

## 5. Weryfikacja

- `https://TWOJA-DOMENA.vercel.app/api/health` — status OK
- Landing → kreator → wygeneruj plan
- Logowanie Google → `/dashboard`

## Limity darmowego planu

- **Vercel Hobby:** ~100 deployów/dzień, funkcje do ~300 s (Fluid Compute)
- **Neon free:** ograniczony rozmiar bazy i compute — wystarczy na demo i mały ruch
- **OpenAI / Mapbox:** według własnych limitów konta

## CLI (opcjonalnie)

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```
