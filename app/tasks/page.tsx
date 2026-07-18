"use client";

import { CheckSquare } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { TasksWorkspace } from "./_components/tasks-workspace";
import { MODULE_META } from "@/lib/types";

export default function TasksPage() {
  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={CheckSquare}
        title="Tasks"
        description="A focused inbox for the things that need to get done — prioritized, dated, and out of your head."
      />

      <TasksWorkspace />

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
