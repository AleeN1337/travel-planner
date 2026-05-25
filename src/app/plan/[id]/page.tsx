import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlanPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Plan ${id}` };
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;

  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/plan/new"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kreator
        </Link>

        <div className="mb-6 flex items-center gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Podgląd
          </Badge>
          <span className="font-mono text-sm text-muted-foreground">{id}</span>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Widok planu podróży</CardTitle>
            <CardDescription>
              Tutaj pojawi się plan dzień po dniu, mapa, budżet i edycja
              drag-and-drop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/plan/new"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
            >
              Wróć do kreatora
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
