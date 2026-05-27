import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { LEGAL_PATHS, SITE_NAME, getLegalContactEmail } from "@/lib/legal/site";

const UPDATED = "25 maja 2026";

export const metadata: Metadata = {
  title: "Regulamin",
  description: `Regulamin korzystania z serwisu ${SITE_NAME}.`,
};

export default function TermsPage() {
  const email = getLegalContactEmail();

  return (
    <LegalPageLayout title="Regulamin serwisu" updatedAt={UPDATED}>
      <LegalSection title="1. Postanowienia ogólne">
        <p>
          Regulamin określa zasady korzystania z serwisu internetowego{" "}
          <strong>{SITE_NAME}</strong> (dalej: „Serwis”), dostępnego pod adresem
          udostępnionym przez operatora.
        </p>
        <p>
          Korzystanie z Serwisu, w tym wygenerowanie planu podróży, oznacza
          akceptację Regulaminu oraz{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-primary hover:underline"
          >
            Polityki prywatności
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Charakter usługi">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Plany podróży są <strong>generowane automatycznie przez AI</strong>{" "}
            na podstawie danych wprowadzonych przez użytkownika.
          </li>
          <li>
            Treści mają charakter <strong>informacyjny i inspiracyjny</strong>
            — nie stanowią porady turystycznej, prawnej, medycznej ani
            finansowej.
          </li>
          <li>
            Operator nie gwarantuje aktualności godzin otwarcia, cen, dostępności
            atrakcji ani bezpieczeństwa miejsc.
          </li>
          <li>
            Użytkownik samodzielnie weryfikuje informacje przed wyjazdem (wizy,
            ubezpieczenie, rezerwacje, sytuacja geopolityczna).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Konto i dostęp do planu">
        <p>
          Serwis może działać w trybie gościa (bez rejestracji). Plan jest
          powiązany z linkiem i opcjonalnie plikiem cookie w przeglądarce.
          <strong>
            {" "}
            Każdy, kto zna link, może uzyskać dostęp do planu
          </strong>{" "}
          — nie udostępniaj linku osobom nieuprawnionym.
        </p>
      </LegalSection>

      <LegalSection title="4. Zasady korzystania">
        <p>Zabrania się m.in.:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            wprowadzania treści bezprawnych, obraźliwych lub naruszających prawa
            osób trzecich,
          </li>
          <li>
            automatycznego masowego wywoływania generowania (nadużycia API),
          </li>
          <li>
            obchodzenia zabezpieczeń lub prób nieautoryzowanego dostępu do
            systemu,
          </li>
          <li>
            wprowadzania danych wrażliwych w kreatorze (np. PESEL, dane
            zdrowotne) — chyba że jest to niezbędne i świadome.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Płatności">
        <p>
          Obecnie podstawowe korzystanie z Serwisu może być bezpłatne. Operator
          zastrzega możliwość wprowadzenia planów płatnych lub limitów — z
          odpowiednim wyprzedzeniem.
        </p>
      </LegalSection>

      <LegalSection title="6. Odpowiedzialność">
        <p>
          W najszerszym dopuszczalnym przez prawo zakresie operator nie ponosi
          odpowiedzialności za szkody wynikłe z korzystania z planów AI, w tym
          decyzje podróżne użytkownika, błędy modelu, niedostępność Serwisu lub
          działanie podmiotów trzecich (mapy, pogoda, linie lotnicze).
        </p>
      </LegalSection>

      <LegalSection title="7. Prawa autorskie">
        <p>
          Oprogramowanie Serwisu, layout i marka należą do operatora. Treści
          wygenerowane dla użytkownika mogą być używane przez użytkownika na
          własny użytek prywatny; komercyjna redystrybucja całego planu może
          wymagać zgody operatora.
        </p>
      </LegalSection>

      <LegalSection title="8. Reklamacje i kontakt">
        <p>
          Uwagi i reklamacje:{" "}
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
          . Odpowiedź w rozsądnym terminie, nie dłużej niż 30 dni w typowych
          przypadkach.
        </p>
      </LegalSection>

      <LegalSection title="9. Zmiany Regulaminu">
        <p>
          Operator może zmienić Regulamin. Dalsze korzystanie po publikacji
          zmian oznacza akceptację, o ile prawo nie wymaga innej formy
          komunikacji.
        </p>
      </LegalSection>

      <LegalSection title="10. Prawo właściwe">
        <p>
          Regulamin podlega prawu polskiemu. Spory rozstrzygane będą przez sąd
          właściwy według przepisów powszechnie obowiązujących.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
