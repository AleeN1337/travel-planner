import Link from "next/link";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { auth, signOut } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function UserNav() {
  let session = null;
  try {
    session = await auth();
  } catch {
    return <AuthLinks />;
  }

  if (!session?.user) {
    return <AuthLinks />;
  }

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        name={session.user.name}
        email={session.user.email}
        image={session.user.image}
      />
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1 text-muted-foreground",
          )}
          aria-label="Wyloguj"
        >
          <LogOut className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Wyloguj</span>
        </button>
      </form>
    </div>
  );
}

function AuthLinks() {
  return (
    <div className="flex items-center gap-1">
      <Link href="/login" aria-label="Zaloguj się">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-white/15 px-2 sm:px-2.5"
        >
          <LogIn className="size-3.5 shrink-0" aria-hidden />
          <span className="hidden min-[400px]:inline">Zaloguj</span>
        </Button>
      </Link>
      <Link href="/register" aria-label="Zarejestruj się">
        <Button
          size="sm"
          className="gap-1 bg-gradient-to-r from-primary/90 to-accent/90 px-2 sm:px-2.5"
        >
          <UserPlus className="size-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Rejestracja</span>
        </Button>
      </Link>
    </div>
  );
}
