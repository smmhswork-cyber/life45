"use client";

import { useEffect, useState } from "react";
import { LineChart } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { id } from "@/lib/utils";
import { MODULE_META, type Habit } from "@/lib/types";
import { safeStorage } from "@/lib/storage";

function makeSampleHabit(name: string, streakDays: number): Habit {
  const completions: string[] = [];
  const today = new Date();
  for (let i = 0; i < streakDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    completions.push(d.toISOString().slice(0, 10));
  }
  return {
    id: id("habit"),
    name,
    completions,
    createdAt: new Date().toISOString(),
  };
}

const SAMPLES: Habit[] = [
  makeSampleHabit("Read for 20 minutes", 3),
  makeSampleHabit("Morning walk", 5),
  makeSampleHabit("Deep work block", 2),
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);

  useEffect(() => {
    setHabits(safeStorage.get<Habit[]>(MODULE_META.habits.storageKey) ?? []);
  }, []);

  const seed = () => {
    safeStorage.set(MODULE_META.habits.storageKey, SAMPLES);
    setHabits(SAMPLES);
  };

  const hasData = (habits?.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={LineChart}
        title="Habits"
        description="Small, recurring behaviors that compound. Track them daily and watch the streaks build."
      />

      {!hasData ? (
        <>
          <EmptyState
            icon={LineChart}
            title="Build one habit at a time"
            description="Coming features: per-habit streak counters, weekly heatmap, reminder cues, and a 'minimum viable day' view."
          />
          <Button onClick={seed}>
            <LineChart size={16} strokeWidth={2} />
            Seed sample habits
          </Button>
        </>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits!.map((h) => (
            <li
              key={h.id}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5"
            >
              <p className="font-medium">{h.name}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {h.completions.length} check-ins on record
              </p>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-5 bg-[var(--color-muted)]/40">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
          Storage contract
        </p>
        <pre className="mt-2 overflow-x-auto text-xs font-mono text-[var(--color-muted-foreground)] leading-relaxed">
{`Type:      Habit[]
Key:       ${MODULE_META.habits.storageKey}
Defaults:  []`}
        </pre>
      </section>
    </div>
  );
}
