# Wdrożenie na Vercel (darmowy plan)

## 1. Baza danych (Neon — darmowy tier)

1. Załóż projekt na [https://neon.tech](https://neon.tech)
2. Skopiuj **Connection string** z Neon; jeśli ma `sslmode=require`, zamień na `sslmode=verify-full` (lub zostaw — aplikacja normalizuje URL automatycznie)
3. W Neon → **SQL Editor** lub lokalnie:

```bash
# Ustaw DATABASE_URL na connection string z Neon, potem:
npx prisma db push
```

## 2. Projekt na Vercel

1. Wejdź na [https://vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → `AleeN1337/travel-planner`
3. Framework: **Next.js** (wykryje automatycznie)
4. **Environment Variables** — dodaj zmienne z `.env.example` (**tylko wartości**, bez nazwy i cudzysłowów)

| Zmienna | Wymagane | Uwagi |
|---------|----------|--------|
| `DATABASE_URL` | tak | Neon connection string |
| `OPENAI_API_KEY` | tak | generowanie planów |
| `OPENAI_MODEL` | nie | domyślnie `gpt-4o-mini` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | dla mapy | token publiczny Mapbox |
| `OPENWEATHER_API_KEY` | nie | pogoda opcjonalna |
| `LEGAL_CONTACT_EMAIL` | tak (publicznie) | RODO / regulamin / kontakt |
| `UPSTASH_REDIS_REST_URL` | zalecane prod | wspólny rate limit między instancjami |
| `UPSTASH_REDIS_REST_TOKEN` | zalecane prod | para do URL powyżej |

5. **Deploy**

## 3. Mapbox

Token z [Mapbox](https://account.mapbox.com/access-tokens/) — ogranicz URL do domeny Vercel (opcjonalnie).

## 4. Weryfikacja

- `https://TWOJA-DOMENA.vercel.app/api/health` — `status: ok`, `rateLimit: "redis"` (gdy Upstash skonfigurowany)
- Landing → kreator → wygeneruj plan (bez logowania)

## 5. Bezpieczeństwo (wdrożone w aplikacji)

- **Nagłówki HTTP** (CSP, HSTS, `X-Frame-Options`, …) — `src/proxy.ts`
- **Rate limiting** per IP na API — `src/lib/security/`
- **Ciasteczko gościa** — `HttpOnly`, `Secure` w produkcji
- **Limit rozmiaru body** — 512 KB na żądaniach JSON

Na Vercel bez Upstash limit działa tylko w pamięci pojedynczej instancji — dla produkcji dodaj **Upstash Redis**.

## Limity darmowego planu

- **Vercel Hobby:** ~100 deployów/dzień
- **Neon free:** ograniczony rozmiar bazy
- **OpenAI / Mapbox:** według limitów konta

## CLI (opcjonalnie)

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```
