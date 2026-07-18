"use client";

import { cn } from "@/lib/utils";
import {
  HABIT_VIEW_LABELS,
  type HabitView,
} from "@/lib/types";

const VIEWS: HabitView[] = ["week", "month", "year"];

/**
 * Segmented control used to choose how many days the grid + chart span.
 * Kept as its own component so workspace state, grid, and chart all share a
 * single source of truth for which window is active.
 */
export function ViewSwitcher({
  value,
  onChange,
}: {
  value: HabitView;
  onChange: (next: HabitView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Habits time window"
      className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/60 p-0.5"
    >
      {VIEWS.map((v) => {
        const isActive = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(v)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium tracking-wide rounded-[calc(var(--radius-md)-2px)]",
              "transition-all duration-150",
              isActive
                ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-sm)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
            )}
          >
            {HABIT_VIEW_LABELS[v]}
          </button>
        );
      })}
    </div>
  );
}
