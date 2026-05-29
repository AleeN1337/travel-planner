import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InviteInvalidFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-28">
      <Card className="glass-card max-w-md border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" aria-hidden />
            <CardTitle className="font-heading text-xl">
              Link nieważny
            </CardTitle>
          </div>
          <CardDescription>
            To zaproszenie wygasło lub zostało unieważnione. Poproś organizatora
            o nowy link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Strona główna
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
