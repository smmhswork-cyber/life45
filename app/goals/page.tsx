"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { id } from "@/lib/utils";
import { MODULE_META, type Goal, type Milestone } from "@/lib/types";
import { safeStorage } from "@/lib/storage";

function makeMilestone(title: string, done = false): Milestone {
  return { id: id("ms"), title, done };
}

function makeSampleGoal(title: string, description: string, ms: Array<[string, boolean]>): Goal {
  const now = new Date().toISOString();
  return {
    id: id("goal"),
    title,
    description,
    milestones: ms.map(([title, done]) => makeMilestone(title, done)),
    createdAt: now,
    updatedAt: now,
  };
}

const SAMPLES: Goal[] = [
  makeSampleGoal("Ship Life45 v0.1", "Initial scaffold with all modules wired.", [
    ["Scaffold Next.js project", true],
    ["Define types & storage", true],
    ["Build dashboard", false],
    ["Polish UI", false],
  ]),
  makeSampleGoal("Read 12 books this year", "Mix of fiction, craft, and biographies.", [
    ["Book #1", true],
    ["Book #2", false],
  ]),
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[] | null>(null);

  useEffect(() => {
    setGoals(safeStorage.get<Goal[]>(MODULE_META.goals.storageKey) ?? []);
  }, []);

  const seed = () => {
    safeStorage.set(MODULE_META.goals.storageKey, SAMPLES);
    setGoals(SAMPLES);
  };

  const hasData = (goals?.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={Target}
        title="Goals"
        description="Outcomes worth pursuing. Break them into milestones, set a target date, and revisit weekly."
      />

      {!hasData ? (
        <>
          <EmptyState
            icon={Target}
            title="Long-form objectives, broken into milestones"
            description="Coming features: progress %, time-to-target estimate, and review prompts on Sundays."
          />
          <Button onClick={seed}>
            <Target size={16} strokeWidth={2} />
            Seed sample goals
          </Button>
        </>
      ) : (
        <ul className="space-y-3">
          {goals!.map((g) => {
            const total = g.milestones.length;
            const done = g.milestones.filter((m) => m.done).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <li
                key={g.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{g.title}</p>
                    {g.description ? (
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        {g.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-medium tabular-nums text-[var(--color-muted-foreground)]">
                    {pct}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
                  <div
                    className="h-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-5 bg-[var(--color-muted)]/40">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
          Storage contract
        </p>
        <pre className="mt-2 overflow-x-auto text-xs font-mono text-[var(--color-muted-foreground)] leading-relaxed">
{`Type:      Goal[]
Key:       ${MODULE_META.goals.storageKey}
Defaults:  []`}
        </pre>
      </section>
    </div>
  );
}
