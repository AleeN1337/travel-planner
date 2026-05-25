# E-mail aktywacyjny — wysyłka do wszystkich użytkowników

Resend z samym `RESEND_API_KEY` **nie wystarczy**: domyślny nadawca `onboarding@resend.dev` działa tylko na adres właściciela konta Resend.

Aby rejestracja działała dla **dowolnego** e-maila użytkownika, wybierz jedną ścieżkę.

## Opcja A — Resend + własna domena (zalecane na Vercel)

### 1. Zweryfikuj domenę

1. [resend.com/domains](https://resend.com/domains) → **Add Domain**
2. Wpisz domenę (np. `twojadomena.pl` — nie musi być ta sama co Vercel)
3. Dodaj rekordy DNS u rejestratora (SPF, DKIM — Resend pokaże dokładne wartości)
4. Poczekaj na status **Verified**

### 2. Zmienne w Vercel

| Zmienna | Przykład |
|---------|----------|
| `RESEND_API_KEY` | `re_...` (sama wartość) |
| `EMAIL_FROM` | `Planer Podróży <noreply@twojadomena.pl>` |

Adres w `EMAIL_FROM` **musi** być z zweryfikowanej domeny (np. `noreply@`, `kontakt@`).

Zaznacz **Production** i **Preview** → **Save** → **Redeploy**.

### 3. Test

- `GET https://twoja-app.vercel.app/api/health` — pole `email.productionReady` powinno być `true`
- Rejestracja na `/register` z dowolnym, prawdziwym adresem e-mail

---

## Opcja B — Gmail SMTP (szybki start bez własnej domeny)

Wysyłka z `@gmail.com` do dowolnych odbiorców (limity Gmail ~500/dzień).

1. Konto Google → **Hasła aplikacji** (2FA wymagane)
2. Vercel:

| Zmienna | Wartość |
|---------|---------|
| `EMAIL_SERVER` | `smtp://twoj@gmail.com:HASLO_APLIKACJI@smtp.gmail.com:587` |
| `EMAIL_FROM` | `Planer Podróży <twoj@gmail.com>` |

Usuń lub zostaw puste `RESEND_API_KEY`, jeśli używasz tylko SMTP.

**Redeploy** po zapisaniu zmiennych.

---

## Błędy

| Objaw | Rozwiązanie |
|-------|-------------|
| 400 + komunikat o domenie / EMAIL_FROM | Ustaw `EMAIL_FROM` ze zweryfikowanej domeny (Resend) |
| „Nie udało się wysłać…” po rejestracji | Logi Vercel → `[register] email:`; sprawdź `EMAIL_FROM` i DNS |
| Mail nie dochodzi | Spam; w Resend → **Emails** sprawdź status dostarczenia |

---

## Lokalnie (`npm run dev`)

Bez SMTP/Resend link aktywacyjny pojawia się w terminalu. To tylko do developmentu.
