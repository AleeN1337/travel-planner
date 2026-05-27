import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { LEGAL_PATHS, SITE_NAME, getLegalContactEmail } from "@/lib/legal/site";

const UPDATED = "25 maja 2026";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: `Polityka prywatności serwisu ${SITE_NAME} (RODO).`,
};

export default function PrivacyPolicyPage() {
  const email = getLegalContactEmail();

  return (
    <LegalPageLayout title="Polityka prywatności" updatedAt={UPDATED}>
      <LegalSection title="1. Administrator danych">
        <p>
          Administratorem danych osobowych w rozumieniu Rozporządzenia Parlamentu
          Europejskiego i Rady (UE) 2016/679 (RODO) jest operator serwisu{" "}
          <strong>{SITE_NAME}</strong> (dalej: „Serwis”).
        </p>
        <p>
          Kontakt w sprawach ochrony danych:{" "}
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Zakres usługi">
        <p>
          Serwis umożliwia tworzenie planów podróży z wykorzystaniem sztucznej
          inteligencji, mapy, checklisty i powiązanych funkcji. Obecnie
          korzystanie nie wymaga rejestracji konta — plan może być powiązany z
          identyfikatorem gościa (plik cookie) oraz adresem URL planu.
        </p>
      </LegalSection>

      <LegalSection title="3. Jakie dane przetwarzamy">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dane z kreatora:</strong> kierunek, liczba dni, preferencje
            podróży, opcjonalnie lotnisko, must-see, unikanie, okolica noclegu
            itp.
          </li>
          <li>
            <strong>Wygenerowany plan:</strong> harmonogram, opisy aktywności,
            szacunki kosztów, checklista — przechowywane w bazie danych.
          </li>
          <li>
            <strong>Identyfikator gościa:</strong> techniczny token w pliku
            cookie (dostęp do własnego planu w tej przeglądarce).
          </li>
          <li>
            <strong>Dane techniczne:</strong> logi hostingu (np. Vercel), adres
            IP, nagłówek przeglądarki — w zakresie niezbędnym do działania i
            bezpieczeństwa.
          </li>
          <li>
            <strong>Korespondencja:</strong> jeśli skontaktujesz się e-mailem.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cele i podstawy prawne">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Świadczenie usługi i generowanie planu — art. 6 ust. 1 lit. b RODO
            (umowa / działania przed zawarciem umowy).
          </li>
          <li>
            Obsługa zapytań — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony
            interes).
          </li>
          <li>
            Bezpieczeństwo, zapobieganie nadużyciom — art. 6 ust. 1 lit. f RODO.
          </li>
          <li>
            Obowiązki prawne — art. 6 ust. 1 lit. c RODO, jeśli mają
            zastosowanie.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Odbiorcy danych (podmioty przetwarzające)">
        <p>Dane mogą być przekazywane zaufanym dostawcom technologii:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>OpenAI</strong> — generowanie treści planu i funkcji AI
            (treści z kreatora trafiają do API zgodnie z ustawieniami modelu).
          </li>
          <li>
            <strong>Neon / PostgreSQL</strong> — hosting bazy danych planów.
          </li>
          <li>
            <strong>Vercel</strong> — hosting aplikacji.
          </li>
          <li>
            <strong>Mapbox</strong> — wyświetlanie map (token po stronie
            klienta).
          </li>
          <li>
            <strong>OpenWeather</strong> — opcjonalna pogoda (jeśli włączona).
          </li>
        </ul>
        <p>
          Z dostawcami zawierane są standardowe umowy powierzenia lub stosowane
          są ich standardowe klauzule (w tym dla transferów poza EOG, jeśli
          występują).
        </p>
      </LegalSection>

      <LegalSection title="6. Okres przechowywania">
        <p>
          Plany i dane kreatora przechowujemy do czasu usunięcia planu,
          wygaśnięcia projektu lub żądania usunięcia — w zależności od tego, co
          nastąpi wcześniej. Logi techniczne — zgodnie z polityką hostingu,
          zwykle do kilkunastu miesięcy.
        </p>
      </LegalSection>

      <LegalSection title="7. Twoje prawa">
        <p>Masz prawo do:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>dostępu do danych,</li>
          <li>sprostowania,</li>
          <li>usunięcia („prawo do bycia zapomnianym”),</li>
          <li>ograniczenia przetwarzania,</li>
          <li>przenoszenia danych,</li>
          <li>sprzeciwu wobec przetwarzania na podstawie art. 6 ust. 1 lit. f,</li>
          <li>
            cofnięcia zgody — jeśli przetwarzanie na niej polega (bez wpływu na
            zgodność z prawem przed cofnięciem),
          </li>
          <li>
            skargi do Prezesa UODO (
            <a
              href="https://uodo.gov.pl"
              className="text-primary hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              uodo.gov.pl
            </a>
            ).
          </li>
        </ul>
        <p>
          Wnioski realizuj przez:{" "}
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Bezpieczeństwo">
        <p>
          Stosujemy środki organizacyjne i techniczne adekwatne do ryzyka (m.in.
          szyfrowane połączenie HTTPS, ograniczony dostęp do bazy, klucze API
          poza repozytorium kodu).
        </p>
      </LegalSection>

      <LegalSection title="9. Zmiany">
        <p>
          Polityka może być aktualizowana. Data na górze dokumentu wskazuje
          ostatnią wersję. Istotne zmiany będą komunikowane w Serwisie.
        </p>
      </LegalSection>

      <p className="text-sm text-muted-foreground">
        Zobacz także:{" "}
        <Link href={LEGAL_PATHS.terms} className="text-primary hover:underline">
          Regulamin
        </Link>
        ,{" "}
        <Link href={LEGAL_PATHS.cookies} className="text-primary hover:underline">
          Polityka cookies
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
