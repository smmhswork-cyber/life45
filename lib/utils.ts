import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ID } from "@/lib/types";

/** Tailwind-merge + clsx combo — used in every UI primitive. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* IDs                                                                */
/* ------------------------------------------------------------------ */

export function id(prefix: string): ID {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}

/* ------------------------------------------------------------------ */
/* Dates                                                              */
/* ------------------------------------------------------------------ */

/** YYYY-MM-DD in local time (not UTC — keeps "today" stable on rollover). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today as YYYY-MM-DD in local time — accepts an optional Date for offsets. */
export function todayKey(d?: Date): string {
  return toDateKey(d ?? new Date());
}

/** Short 3-letter month label (\"Jul\"). */
export function shortMonth(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short" });
}

/** Parse YYYY-MM-DD as local midnight (avoids the off-by-one UTC shift). */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Pretty long-form date for headers ("Tuesday, July 18"). */
export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Short weekday label ("Mon"). */
export function shortDayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

/**
 * Returns the inclusive array of date keys covering the last `days` days,
 * ending today (most-recent element is the last index). Useful for both the
 * habit grid and the chart's X axis.
 */
export function lastNDates(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(toDateKey(d));
  }
  return out;
}

export function isToday(key: string): boolean {
  return key === toDateKey(new Date());
}

/* ------------------------------------------------------------------ */
/* Habit streak math                                                  */
/* ------------------------------------------------------------------ */

/** Length of the current run of consecutive completed days, ending today. */
export function currentStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  const set = new Set(completions);
  let streak = 0;
  const cur = new Date();
  while (set.has(toDateKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

/** Longest run found anywhere in the completions array. */
export function longestStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  const sorted = [...completions].sort();
  let best = 1;
  let run = 1;
  let prev = fromDateKey(sorted[0]!);
  for (let i = 1; i < sorted.length; i++) {
    const d = fromDateKey(sorted[i]!);
    const diff = Math.round(
      (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
    prev = d;
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Color palette                                                      */
/* ------------------------------------------------------------------ */

export const PALETTE: string[] = [
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // amber
  "#65a30d", // lime
  "#16a34a", // green
  "#0d9488", // teal
  "#0891b2", // cyan
  "#0284c7", // sky
  "#2563eb", // blue
  "#7c3aed", // violet
  "#a21caf", // fuchsia
  "#db2777", // pink
];

const DEFAULT_HABIT_COLOR = "#ea580c";

/**
 * Densely-stable color picker: hashes an ID into the palette so a habit
 * always renders in the same color even after a Reload, but the picker is
 * still editable via Settings.
 */
export function colorForId(idValue: string): string {
  if (!idValue) return DEFAULT_HABIT_COLOR;
  let h = 0;
  for (let i = 0; i < idValue.length; i++) {
    h = (h << 5) - h + idValue.charCodeAt(i);
    h |= 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length] ?? DEFAULT_HABIT_COLOR;
}

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function pluralize(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}
