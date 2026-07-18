"use client";

import { cn } from "@/lib/utils";
import type { ClassPeriod } from "@/lib/types";

export type PeriodFilterId = "all" | "untagged" | string;

/**
 * Single-select chip row that drives which assignment subset is visible.
 * Counts come from the parent so chip labels announce "5" or "12" right on
 * the surface — no extra "X assignments" header needed.
 */
export function PeriodFilter({
  periods,
  value,
  onChange,
  counts,
}: {
  periods: ClassPeriod[];
  value: PeriodFilterId;
  onChange: (next: PeriodFilterId) => void;
  counts: Record<string, number>;
}) {
  const chips: { id: PeriodFilterId; label: string; color?: string }[] = [
    { id: "all", label: "All" },
    ...periods.map((p) => ({ id: p.id, label: p.name, color: p.color })),
    { id: "untagged", label: "Untagged" },
  ];

  if (periods.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Add class periods in{" "}
        <a href="/settings" className="underline">
          Settings
        </a>{" "}
        to start tagging assignments.
      </p>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Filter assignments by period"
      className="flex flex-wrap gap-1.5"
    >
      {chips.map((c) => {
        const isActive = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              "transition-all duration-150 border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
              isActive
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]"
                : "bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/30",
            )}
          >
            {c.color && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
            )}
            {c.label}
            {c.id !== "all" && counts[c.id] !== undefined && (
              <span
                className={cn(
                  "ml-1 tabular-nums text-[10px]",
                  isActive
                    ? "text-[var(--color-primary-foreground)]/80"
                    : "text-[var(--color-muted-foreground)]/80",
                )}
              >
                {counts[c.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
