import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { RegisterPanel } from "@/components/auth/register-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rejestracja",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mesh-hero flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-28">
      <Card className="glass-card w-full max-w-md border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <UserPlus className="size-6 text-primary-foreground" aria-hidden />
          </div>
          <CardTitle className="font-heading text-2xl">Rejestracja</CardTitle>
          <CardDescription>
            E-mail z aktywacją lub szybkie konto przez Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterPanel />
        </CardContent>
      </Card>
    </div>
  );
}
