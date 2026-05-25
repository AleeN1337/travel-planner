import { signIn } from "@/auth";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  redirectTo: string;
  label: string;
};

export function GoogleSignInButton({ redirectTo, label }: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
    >
      <Button
        type="submit"
        variant="outline"
        className="w-full gap-2 border-white/15 bg-white/[0.03] hover:bg-white/[0.06]"
      >
        <GoogleIcon />
        {label}
      </Button>
    </form>
  );
}
