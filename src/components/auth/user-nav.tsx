import { LogIn, LogOut } from "lucide-react";
import { auth, signIn, signOut } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function UserNav() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="gap-1.5 border-white/15"
        >
          <LogIn className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Zaloguj</span>
        </Button>
      </form>
    );
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
        >
          <LogOut className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Wyloguj</span>
        </button>
      </form>
    </div>
  );
}
