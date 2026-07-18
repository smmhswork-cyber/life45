"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Flame, ListChecks, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MODULE_META, type Habit, type HabitView } from "@/lib/types";
import { HabitGrid } from "./habit-grid";
import { HabitChart, computeStats } from "./habit-chart";
import { ViewSwitcher } from "./view-switcher";

export function HabitsWorkspace() {
  const [habits, setHabits, isHydrated] = useLocalStorage<Habit[]>(
    MODULE_META.habits.storageKey,
    [],
  );
  const [view, setView] = useState<HabitView>("month");

  const onToggle = useCallback(
    (habitId: string, dateKey: string) => {
      setHabits((prev) => {
        const next = prev.map((h) => {
          if (h.id !== habitId) return h;
          const set = new Set(h.completions);
          set.has(dateKey) ? set.delete(dateKey) : set.add(dateKey);
          return { ...h, completions: Array.from(set).sort() };
        });
        return next;
      });
    },
    [setHabits],
  );

  if (!isHydrated) {
    return (
      <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/60 animate-pulse" />
    );
  }

  const stats = computeStats(habits);

  return (
    <div className="space-y-6">
      {/* View selector + today summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewSwitcher value={view} onChange={setView} />
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
          <span className="inline-flex items-center gap-1.5">
            <ListChecks size={12} strokeWidth={2} />
            <strong className="font-semibold text-[var(--color-foreground)] tabular-nums">
              {stats.todayDone}/{stats.todayTotal}
            </strong>{" "}
            today
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flame size={12} strokeWidth={2} />
            <strong className="font-semibold text-[var(--color-foreground)] tabular-nums">
              {stats.streakDays}
            </strong>
            d streak
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={2} />
            <strong className="font-semibold text-[var(--color-foreground)] tabular-nums">
              {stats.totalCheckIns}
            </strong>{" "}
            total
          </span>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyHabits />
      ) : (
        <>
          <HabitGrid habits={habits} view={view} onToggle={onToggle} />
          <HabitChart habits={habits} view={view} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyHabits() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Build one habit at a time</CardTitle>
        <CardDescription>
          Add the small behaviors you want to keep. Each one becomes a row in
          the grid below; a checkbox for every day in your active view.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Maximum 20 habits. Edit colors and names any time.
        </p>
        <Button asChild>
          <Link href="/settings">
            <Settings size={14} strokeWidth={2} />
            Open settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
