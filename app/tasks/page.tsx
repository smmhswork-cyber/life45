"use client";

import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { id, todayKey } from "@/lib/utils";
import { MODULE_META, type Task } from "@/lib/types";
import { safeStorage } from "@/lib/storage";

function makeSampleTask(title: string, priority: Task["priority"], dueOffset = 0): Task {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + dueOffset);
  return {
    id: id("task"),
    title,
    done: false,
    priority,
    dueDate: dueOffset === 0 ? undefined : todayKey(due),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

const SAMPLES: Task[] = [
  makeSampleTask("Define this week's top three outcomes", "high", 0),
  makeSampleTask("Draft Life45 launch note", "medium", 1),
  makeSampleTask("Schedule 30-minute review", "low", 3),
];

export default function TasksPage() {
  const [seeded, setSeeded] = useState<Task[] | null>(null);

  // Read pre-existing data on mount so the user sees what's already in storage.
  useEffect(() => {
    setSeeded(safeStorage.get<Task[]>(MODULE_META.tasks.storageKey) ?? []);
  }, []);

  const seed = () => {
    safeStorage.set(MODULE_META.tasks.storageKey, SAMPLES);
    setSeeded(SAMPLES);
  };

  const hasData = (seeded?.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={CheckSquare}
        title="Tasks"
        description="A focused inbox for the things that need to get done — prioritized, dated, and out of your head."
      />

      {!hasData ? (
        <>
          <EmptyState
            icon={CheckSquare}
            title="Your task workspace is ready"
            description="Wire the TaskInput form below this block to add, complete, and prioritize items. They persist in your browser via localStorage."
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={seed}>
              <CheckSquare size={16} strokeWidth={2} />
              Seed sample data
            </Button>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Writes 3 sample tasks to <code className="font-mono">{MODULE_META.tasks.storageKey}</code>
            </span>
          </div>
        </>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]">
          {seeded!.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                {t.dueDate ? (
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    Due {t.dueDate}
                  </p>
                ) : null}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
                {t.priority}
              </span>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-5 bg-[var(--color-muted)]/40">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
          Storage contract
        </p>
        <pre className="mt-2 overflow-x-auto text-xs font-mono text-[var(--color-muted-foreground)] leading-relaxed">
{`Type:      Task[]
Key:       ${MODULE_META.tasks.storageKey}
Defaults:  []`}
        </pre>
      </section>
    </div>
  );
}
