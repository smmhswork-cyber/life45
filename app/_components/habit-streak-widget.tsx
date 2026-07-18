"use client";

import Link from "next/link";
import { Flame, Sparkles, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeStats } from "@/app/habits/_components/habit-chart";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MODULE_META, type Habit } from "@/lib/types";
import { todayKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Dashboard habit overview. Renders today's check-in progress and the current
 * streak so the user can see momentum without leaving the home page. Skips
 * itself entirely if no habits exist — no "0 of 0" encouragement needed.
 */
export function HabitStreakWidget() {
  const [habits, , isHydrated] = useLocalStorage<Habit[]>(
    MODULE_META.habits.storageKey,
    [],
  );

  if (!isHydrated) {
    return (
      <Card>
        <CardHeader>
          <div className="h-4 w-32 rounded bg-[var(--color-muted)] animate-pulse" />
          <div className="h-3 w-48 rounded bg-[var(--color-muted)]/60 animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-24 rounded bg-[var(--color-muted)] animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card className="bg-[var(--color-muted)]/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.75} className="text-[var(--color-primary)]" />
            Build a habit
          </CardTitle>
          <CardDescription>
            Pick a small, recurring behavior and track it from the Habits page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/habits"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Open Habits
            <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const stats = computeStats(habits);
  const doneToday = stats.todayDone;
  const total = stats.todayTotal;
  const today = todayKey();
  const todaysHabits = habits
    .slice()
    .sort((a, b) => Number(b.completions.includes(today)) - Number(a.completions.includes(today)));

  const percent = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <Flame
            size={14}
            strokeWidth={1.75}
            className={cn(stats.streakDays > 0 ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]")}
          />
          Habits today
        </CardTitle>
        <CardDescription>
          {doneToday === total
            ? "All habits checked in. Beautiful."
            : `${doneToday} of ${total} done`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-semibold tabular-nums">
              {doneToday}
              <span className="text-base text-[var(--color-muted-foreground)] font-medium">
                {" "}/ {total}
              </span>
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] tabular-nums">
              {percent}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--color-muted)] overflow-hidden">
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Today's habit progress"
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <Flame
              size={16}
              strokeWidth={1.75}
              className={cn(stats.streakDays > 0 ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]")}
            />
            <div className="leading-tight">
              <p className="text-sm font-medium">
                {stats.streakDays === 0
                  ? "Start a streak today"
                  : stats.streakDays === 1
                    ? "1 day streak"
                    : `${stats.streakDays} day streak`}
              </p>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                {stats.totalCheckIns} total check-ins
              </p>
            </div>
          </div>
          <Link
            href="/habits"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Open
            <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>

        {/* Today's habits (compact) */}
        <ul className="space-y-1.5">
          {todaysHabits.slice(0, 5).map((h) => {
            const isDone = h.completions.includes(today);
            return (
              <li
                key={h.id}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-3 w-3 rounded-sm border-2 shrink-0 transition-colors",
                    isDone
                      ? "border-transparent"
                      : "border-[var(--color-border)]",
                  )}
                  style={isDone ? { backgroundColor: h.color } : undefined}
                />
                <span
                  className={cn(
                    "truncate",
                    isDone && "text-[var(--color-muted-foreground)] line-through",
                  )}
                >
                  {h.name}
                </span>
              </li>
            );
          })}
          {todaysHabits.length > 5 && (
            <li className="text-[11px] text-[var(--color-muted-foreground)] pl-5">
              +{todaysHabits.length - 5} more
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
