"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, type ClassPeriod, type Assignment } from "@/lib/types";
import { cn, id, PALETTE } from "@/lib/utils";

const DEFAULTS: ClassPeriod[] = [
  { id: "period_1", name: "Period 1", color: PALETTE[0]! },
  { id: "period_2", name: "Period 2", color: PALETTE[7]! },
  { id: "period_3", name: "Period 3", color: PALETTE[4]! },
  { id: "period_4", name: "Period 4", color: PALETTE[9]! },
];

/**
 * Class Periods editor — manage the tags assigned to each Assignment. We
 * store them separately so Settings can manage the taxonomy without touching
 * the (frequently-edited) assignments list.
 *
 * Deleting a period reassigns any assignments that referenced it to `null`
 * ("Untagged") so the assignments page never goes blank for a slice of data.
 */
export function PeriodsEditor() {
  const [periods, setPeriods, isHydrated] = useLocalStorage<ClassPeriod[]>(
    STORAGE_KEYS.classPeriods,
    DEFAULTS,
  );
  const [assignments] = useLocalStorage<Assignment[]>(
    "life45:assignments:v1",
    [],
  );
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PALETTE[3]!);

  const remove = (periodId: string) => {
    setPeriods(periods.filter((p) => p.id !== periodId));
  };

  const rename = (periodId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPeriods(periods.map((p) => (p.id === periodId ? { ...p, name: trimmed } : p)));
  };

  const recolor = (periodId: string, color: string) => {
    setPeriods(periods.map((p) => (p.id === periodId ? { ...p, color } : p)));
  };

  const add = () => {
    const name = draftName.trim();
    if (!name) return;
    setPeriods([...periods, { id: id("period"), name, color: draftColor }]);
    setDraftName("");
  };

  if (!isHydrated) return null;

  const counts = countByPeriod(assignments, periods);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class periods</CardTitle>
        <CardDescription>
          Tags used to organize assignments. Add a period (e.g. “AP Bio”, “Lunch”,
          “Period 5”) and use it on the Assignments page.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {periods.length > 0 ? (
          <ul className="space-y-2">
            {periods.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <EditableName
                  name={p.name}
                  onSubmit={(n) => rename(p.id, n)}
                  className="flex-1"
                />
                <span className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums">
                  {counts[p.id] ?? 0} assignment{(counts[p.id] ?? 0) === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-destruct)] hover:bg-[var(--color-muted)] transition-colors"
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)] rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-6 text-center">
            No periods yet. Add one below.
          </p>
        )}

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              placeholder="Period name (e.g. AP Bio)"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              maxLength={48}
              className="sm:flex-1"
              aria-label="New period name"
            />
            <Button onClick={add} disabled={!draftName.trim()}>
              <Plus size={14} strokeWidth={2} />
              Add period
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Color
            </span>
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Pick period color ${c}`}
                aria-pressed={draftColor === c}
                onClick={() => setDraftColor(c)}
                className={cn(
                  "h-6 w-6 rounded-full transition-transform border",
                  draftColor === c
                    ? "ring-2 ring-offset-2 ring-offset-[var(--color-card)] ring-[var(--color-ring)] scale-110"
                    : "border-[var(--color-border)] hover:scale-105",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <p className="flex items-center gap-2 text-[11px] text-[var(--color-muted-foreground)]">
            <AlertCircle size={12} strokeWidth={1.75} />
            Deleting a period moves its assignments to{" "}
            <code className="font-mono text-[10px]">Untagged</code>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Inline editing helper                                              */
/* ------------------------------------------------------------------ */

function EditableName({
  name,
  onSubmit,
  className,
}: {
  name: string;
  onSubmit: (next: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onSubmit(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit(draft);
            setEditing(false);
          } else if (e.key === "Escape") {
            setDraft(name);
            setEditing(false);
          }
        }}
        className={className}
        maxLength={48}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name);
        setEditing(true);
      }}
      className={cn(
        "text-left text-sm font-medium truncate hover:underline",
        className,
      )}
    >
      {name}
    </button>
  );
}

function countByPeriod(
  assignments: Assignment[],
  periods: ClassPeriod[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of assignments) {
    if (a.periodId === null) continue;
    out[a.periodId] = (out[a.periodId] ?? 0) + 1;
  }
  const ids = new Set(periods.map((p) => p.id));
  for (const id of Object.keys(out)) {
    if (!ids.has(id)) out[id] = 0;
  }
  return out;
}
