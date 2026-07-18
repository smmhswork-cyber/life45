import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional eyebrow label (e.g. "Module") — kept tiny & uppercase */
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ModuleHeader({
  icon: Icon,
  title,
  description,
  eyebrow = "Module",
  actions,
  className,
}: ModuleHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-6 pb-8", className)}>
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
            aria-hidden
          >
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">{title}</h1>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
