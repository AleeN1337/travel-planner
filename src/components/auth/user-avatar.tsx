import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
};

export function UserAvatar({ name, email, image, className }: UserAvatarProps) {
  const initial = (name?.[0] ?? email?.[0] ?? "?").toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name ? `Avatar ${name}` : "Avatar użytkownika"}
        referrerPolicy="no-referrer"
        className={cn(
          "size-8 shrink-0 rounded-full border border-white/15 object-cover",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary",
        className,
      )}
      aria-hidden={!name && !email}
    >
      {initial}
    </span>
  );
}
