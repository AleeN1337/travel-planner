import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="px-4 py-28 sm:px-6">
      <article className="prose-legal mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground no-underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Strona główna
        </Link>
        <header className="mb-10 border-b border-white/10 pb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ostatnia aktualizacja: {updatedAt}
          </p>
        </header>
        <div className="space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {children}
        </div>
      </article>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading mb-3 text-xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
