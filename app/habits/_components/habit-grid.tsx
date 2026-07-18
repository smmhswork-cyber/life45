"use client";

import { useMemo } from "react";
import { cn, colorForId, fromDateKey, isToday, lastNDates, shortDayLabel, toDateKey } from "@/lib/utils";
import { HABIT_VIEW_DAYS, type Habit, type HabitView } from "@/lib/types";

/**
 * Pure presentation: renders a grid with one row per habit and N date columns
 * for the active view. Clicking a cell toggles the habit's completion for that
 * date. Today's column is outlined; past dates get a subtle separation line.
 *
 * Performance: year view is 20×365 = 7,300 buttons. Each card is light DOM,
 * React's synthetic event delegation handles clicks, and the toggle updates
 * only one closure scope. We do not virtualize.
 */
export function HabitGrid({
  habits,
  view,
  onToggle,
}: {
  habits: Habit[];
  view: HabitView;
  onToggle: (habitId: string, dateKey: string) => void;
}) {
  const days = HABIT_VIEW_DAYS[view];
  const dates = useMemo(() => lastNDates(days), [days]);
  const today = toDateKey(new Date());

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <div
          className="grid min-w-full"
          style={{
            gridTemplateColumns: `minmax(180px, 220px) repeat(${dates.length}, minmax(${
              view === "year" ? 12 : 28
            }px, 1fr))`,
          }}
          role="grid"
          aria-label={`Habit grid for the last ${days} days`}
        >
          <HeaderCell sticky>{`Habit · ${days}d`}</HeaderCell>
          {dates.map((d) => (
            <DateHeader key={d} dateKey={d} view={view} today={d === today} />
          ))}

          {habits.length === 0 && (
            <div
              className="col-span-full px-6 py-10 text-sm text-center text-[var(--color-muted-foreground)]"
              role="row"
            >
              No habits yet. Add some in{" "}
              <a className="underline" href="/settings">
                Settings
              </a>
              .
            </div>
          )}

          {habits.map((h) => {
            const habitSet = new Set(h.completions);
            const color = h.color || colorForId(h.id);
            return (
              <RowContent key={h.id} habit={h} color={color}>
                {dates.map((d) => {
                  const isTodayCell = d === today;
                  const completed = habitSet.has(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      role="gridcell"
                      aria-pressed={completed}
                      aria-label={`${completed ? "Unmark" : "Mark"} ${h.name} for ${formatFullDate(d)}`}
                      onClick={() => onToggle(h.id, d)}
                      className={cn(
                        "aspect-square w-full rounded-[3px] border transition-all duration-100",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
                        completed
                          ? "border-transparent hover:brightness-110 hover:saturate-110"
                          : "border-[var(--color-border)]/60 bg-[var(--color-muted)]/40 hover:border-[var(--color-border)]",
                        isTodayCell &&
                          "ring-2 ring-inset ring-[var(--color-primary)]/40",
                      )}
                      style={completed ? { backgroundColor: color } : undefined}
                    />
                  );
                })}
              </RowContent>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                     */
/* ------------------------------------------------------------------ */

function RowContent({
  habit,
  color,
  children,
}: {
  habit: Habit;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="sticky left-0 z-10 flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border-r border-[var(--color-border)]"
        role="rowheader"
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium truncate" title={habit.name}>
          {habit.name}
        </span>
      </div>
      {children}
    </>
  );
}

function HeaderCell({
  children,
  sticky,
}: {
  children: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] border-b border-[var(--color-border)] bg-[var(--color-muted)]/40",
        sticky && "sticky left-0 z-10",
      )}
      role="columnheader"
    >
      {children}
    </div>
  );
}

function DateHeader({
  dateKey,
  view,
  today,
}: {
  dateKey: string;
  view: HabitView;
  today: boolean;
}) {
  const d = fromDateKey(dateKey);
  let label: string;
  if (view === "week") label = shortDayLabel(d);
  else if (view === "month") label = String(d.getDate());
  else {
    // year: month abbreviations appear on the 1st and every ~30 days
    label = d.getDate() === 1 || isFirstOfMonth(d, view) ? shortMonth(d) : "";
  }
  return (
    <div
      className={cn(
        "px-1 py-1.5 text-[10px] text-center border-b border-[var(--color-border)] bg-[var(--color-muted)]/40",
        today && "text-[var(--color-primary)] font-semibold",
      )}
      role="columnheader"
      title={formatFullDate(dateKey)}
    >
      {label}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers local to this component                                    */
/* ------------------------------------------------------------------ */

function shortMonth(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short" });
}

/** Returns true if `d` is the first day of a month AND we want to show a label. */
function isFirstOfMonth(d: Date, view: HabitView): boolean {
  if (view !== "year") return false;
  return d.getDate() === 1;
}

function formatFullDate(d: string): string {
  const date = fromDateKey(d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export { formatFullDate, isToday };
