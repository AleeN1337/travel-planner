import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="outline">Szkielet</Badge>
        <span className="text-sm text-muted-foreground">ID: {id}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widok planu podróży</CardTitle>
          <CardDescription>
            Tutaj pojawi się plan dzień po dniu, mapa, budżet i edycja
            drag-and-drop (Fazy 1–4).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/plan/new"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Wróć do kreatora
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
