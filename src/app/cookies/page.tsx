import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { LEGAL_PATHS, SITE_NAME } from "@/lib/legal/site";

const UPDATED = "25 maja 2026";

export const metadata: Metadata = {
  title: "Polityka cookies",
  description: `Informacja o plikach cookie i pamięci lokalnej w ${SITE_NAME}.`,
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Polityka cookies" updatedAt={UPDATED}>
      <LegalSection title="1. Czym są cookies">
        <p>
          Pliki cookie to małe pliki tekstowe zapisywane w urządzeniu użytkownika.
          Służą m.in. utrzymaniu sesji i zapamiętaniu ustawień.
        </p>
      </LegalSection>

      <LegalSection title="2. Pamięć lokalna (localStorage)">
        <p>
          Oprócz cookies Serwis może używać <strong>pamięci lokalnej</strong>{" "}
          przeglądarki (localStorage) do:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>zapisu postępu kreatora podróży (szkic formularza),</li>
          <li>zapisu informacji o zgodzie na cookies,</li>
        </ul>
        <p>
          Nie jest to plik cookie, ale podobnie identyfikuje przeglądarkę — opisujemy
          to w tym dokumencie dla przejrzystości.
        </p>
      </LegalSection>

      <LegalSection title="3. Jakich cookies używamy">
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-3 font-medium">Nazwa / typ</th>
                <th className="p-3 font-medium">Cel</th>
                <th className="p-3 font-medium">Czas</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-white/5">
                <td className="p-3 font-mono text-xs">guest_plan_token</td>
                <td className="p-3">
                  Niezbędny — rozpoznanie gościa przy edycji własnego planu
                </td>
                <td className="p-3">do 1 roku</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3 font-mono text-xs">tp-cookie-consent-v1</td>
                <td className="p-3">
                  localStorage — zapis wyboru w banerze cookies
                </td>
                <td className="p-3">do czasu usunięcia</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">travel-planner-wizard</td>
                <td className="p-3">
                  localStorage — szkic kreatora (Zustand persist)
                </td>
                <td className="p-3">do czasu usunięcia</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="4. Cookies analityczne i marketingowe">
        <p>
          <strong>Obecnie nie używamy</strong> Google Analytics, Meta Pixel ani
          podobnych narzędzi śledzących. Jeśli je włączymy, zaktualizujemy ten
          dokument i poprosimy o zgodę w banerze.
        </p>
      </LegalSection>

      <LegalSection title="5. Zarządzanie zgodą">
        <p>
          Przy pierwszej wizycie wyświetlamy baner z wyborem. Możesz usunąć
          cookies w ustawieniach przeglądarki — spowoduje to utratę dostępu do
          planu powiązanego z tokenem gościa w tej przeglądarce.
        </p>
      </LegalSection>

      <LegalSection title="6. Więcej informacji">
        <p>
          Szczegóły przetwarzania danych:{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-primary hover:underline"
          >
            Polityka prywatności
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
