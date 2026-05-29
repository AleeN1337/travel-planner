import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PlanAccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-28">
      <Card className="glass-card max-w-md border-white/10">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lock className="size-5" aria-hidden />
          </div>
          <CardTitle className="font-heading text-xl">Brak dostępu</CardTitle>
          <CardDescription>
            Ten plan jest prywatny. Poproś osobę, która go utworzyła, o link
            zapraszający — bez niego nie otworzysz planu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Link href="/" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            Strona główna
          </Link>
          <Link
            href="/plan/new"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full border-white/15 sm:w-auto",
            )}
          >
            Utwórz własny plan
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
