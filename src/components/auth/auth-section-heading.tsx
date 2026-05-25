import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthSectionHeadingProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export function AuthSectionHeading({
  icon: Icon,
  title,
  description,
  className,
}: AuthSectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 text-left">
        <p className="font-medium leading-tight">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
