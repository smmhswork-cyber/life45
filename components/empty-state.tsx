import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

/**
 * Friendly "coming soon" placeholder for not-yet-wired modules.
 * Each module page renders one of these above its data layer stubs.
 */
export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)]",
        "bg-[var(--color-card)] p-8 sm:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] ring-1 ring-[var(--color-border)]">
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5 max-w-md">
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
            Workspace ready
          </p>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
