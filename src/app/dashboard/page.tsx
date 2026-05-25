import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moje plany",
};

export default function DashboardPage() {
  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-white/5">
              <FolderOpen className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <CardTitle className="font-heading text-2xl">Moje plany</CardTitle>
            <CardDescription>
              Lista zapisanych podróży po zalogowaniu — już wkrótce.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              Brak zapisanych planów. Wygeneruj pierwszy plan w kreatorze.
            </p>
            <Link
              href="/plan/new"
              className={cn(
                buttonVariants(),
                "gap-2 bg-gradient-to-r from-primary to-accent",
              )}
            >
              <Plus className="size-4" aria-hidden />
              Utwórz nowy plan
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
