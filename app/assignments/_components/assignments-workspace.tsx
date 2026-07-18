"use client";

import { useMemo, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  MODULE_META,
  STORAGE_KEYS,
  type Assignment,
  type ClassPeriod,
} from "@/lib/types";
import { cn, fromDateKey, id, toDateKey } from "@/lib/utils";
import { PeriodFilter, type PeriodFilterId } from "./period-filter";
import { AssignmentForm } from "./assignment-form";

type SortKey = "smart" | "dueDate" | "createdAt" | "title";

/**
 * Smart default sort: undone first, then due date ascending (no date → end),
 * then most-recently-created first. The chip filters narrow by tag.
 */
function sortAssignments(
  list: Assignment[],
  sort: SortKey,
): Assignment[] {
  const copy = [...list];
  switch (sort) {
    case "dueDate":
      return copy.sort(compareByDue);
    case "createdAt":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "smart":
    default:
      return copy.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const aDate = a.dueDate ?? "9999-99-99";
        const bDate = b.dueDate ?? "9999-99-99";
        if (aDate !== bDate) return aDate.localeCompare(bDate);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

function compareByDue(a: Assignment, b: Assignment) {
  const ad = a.dueDate ?? "9999-99-99";
  const bd = b.dueDate ?? "9999-99-99";
  return ad.localeCompare(bd);
}

export function AssignmentsWorkspace() {
  const [assignments, setAssignments, isHydrated] = useLocalStorage<Assignment[]>(
    MODULE_META.assignments.storageKey,
    [],
  );
  const [periods] = useLocalStorage<ClassPeriod[]>(
    STORAGE_KEYS.classPeriods,
    [],
  );
  const [filter, setFilter] = useState<PeriodFilterId>("all");
  const [sort, setSort] = useState<SortKey>("smart");
  const [hideDone, setHideDone] = useState(false);

  const visible = useMemo(() => {
    const filtered = assignments.filter((a) => {
      if (filter === "all") return true;
      if (filter === "untagged") return a.periodId === null;
      return a.periodId === filter;
    });
    const visible2 = hideDone ? filtered.filter((a) => !a.done) : filtered;
    return sortAssignments(visible2, sort);
  }, [assignments, filter, sort, hideDone]);

  const add = (input: {
    title: string;
    description: string;
    periodId: string | null;
    dueDate: string | null;
  }) => {
    const now = new Date().toISOString();
    const newItem: Assignment = {
      id: id("asg"),
      title: input.title,
      description: input.description || undefined,
      periodId: input.periodId,
      dueDate: input.dueDate || undefined,
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    setAssignments([newItem, ...assignments]);
  };

  const toggle = (assignmentId: string) => {
    const now = new Date().toISOString();
    setAssignments(
      assignments.map((a) =>
        a.id === assignmentId ? { ...a, done: !a.done, updatedAt: now } : a,
      ),
    );
  };

  const remove = (assignmentId: string) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId));
  };

  const edit = (assignmentId: string, patch: Partial<Assignment>) => {
    const now = new Date().toISOString();
    setAssignments(
      assignments.map((a) =>
        a.id === assignmentId ? { ...a, ...patch, updatedAt: now } : a,
      ),
    );
  };

  if (!isHydrated) {
    return (
      <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/60 animate-pulse" />
    );
  }

  const doneCount = assignments.filter((a) => a.done).length;
  const undoCount = assignments.length - doneCount;

  return (
    <div className="space-y-6">
      {/* Filter + sort row */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <PeriodFilter
            periods={periods}
            value={filter}
            onChange={setFilter}
            counts={periodCounts(assignments)}
          />
          <div className="flex items-center gap-2">
            <label className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Sort
            </label>
            <select
              aria-label="Sort assignments"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={cn(
                "h-8 rounded-[var(--radius-md)] border border-[var(--color-input)] bg-[var(--color-card)]",
                "px-2 text-xs text-[var(--color-foreground)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
              )}
            >
              <option value="smart">Smart</option>
              <option value="dueDate">Due date</option>
              <option value="createdAt">Recently added</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[var(--color-muted-foreground)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => setHideDone(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-primary)]"
          />
          Hide completed ({doneCount})
        </label>
      </div>

      {/* Add form */}
      <AssignmentForm periods={periods} onAdd={add} />

      {/* List */}
      {visible.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {assignments.length === 0
                ? "No assignments yet"
                : "Nothing in this view"}
            </CardTitle>
            <CardDescription>
              {assignments.length === 0
                ? "Add one above to get started. Each assignment needs at least a title and a tag."
                : "Try a different filter or clear the hide-completed toggle."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((a) => (
            <AssignmentRow
              key={a.id}
              a={a}
              periods={periods}
              onToggle={() => toggle(a.id)}
              onRemove={() => remove(a.id)}
              onEdit={(patch) => edit(a.id, patch)}
            />
          ))}
        </ul>
      )}

      <p className="text-[11px] text-[var(--color-muted-foreground)] text-right tabular-nums">
        {undoCount} open · {doneCount} done
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                */
/* ------------------------------------------------------------------ */

const BACKSPACE_HOLD_MS = 350;

function AssignmentRow({
  a,
  periods,
  onToggle,
  onRemove,
  onEdit,
}: {
  a: Assignment;
  periods: ClassPeriod[];
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (patch: Partial<Assignment>) => void;
}) {
  const period = periods.find((p) => p.id === a.periodId);
  const due = a.dueDate ? fromDateKey(a.dueDate) : null;
  const todayKey = toDateKey(new Date());
  const isOverdue =
    !!a.dueDate && a.dueDate < todayKey && !a.done;
  const isDueSoon =
    !isOverdue &&
    !!a.dueDate &&
    a.dueDate >= todayKey &&
    !a.done &&
    (fromDateKey(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 2;

  return (
    <li
      className={cn(
        "group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4",
        "transition-colors hover:border-[var(--color-ring)]/40",
        a.done && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={a.done}
          aria-label={a.done ? `Mark ${a.title} as not done` : `Mark ${a.title} as done`}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
            a.done
              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-foreground)] grid place-items-center"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
          )}
        >
          {a.done && (
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 6.5 L5 9 L10 3" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              a.done && "line-through text-[var(--color-muted-foreground)]",
            )}
          >
            {a.title}
          </p>
          {a.description && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2">
              {a.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {period ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/40 pl-1 pr-2.5 py-0.5 text-[11px]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: period.color }}
                />
                {period.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                Untagged
              </span>
            )}
            {due && (
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  isOverdue
                    ? "text-[var(--color-destruct)] font-medium"
                    : isDueSoon
                      ? "text-[var(--color-primary)] font-medium"
                      : "text-[var(--color-muted-foreground)]",
                )}
              >
                {isOverdue ? "Overdue · " : isDueSoon ? "Due soon · " : "Due "}
                {due.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        <DeleteHoldButton onDelete={onRemove} ariaLabel={`Delete ${a.title}`} />
      </div>
    </li>
  );
}

/* Hold-to-delete so a stray click on the trash icon doesn't lose work. */
function DeleteHoldButton({
  onDelete,
  ariaLabel,
}: {
  onDelete: () => void;
  ariaLabel: string;
}) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHolding(true);
    timerRef.current = setTimeout(() => {
      onDelete();
      setHolding(false);
      timerRef.current = null;
    }, BACKSPACE_HOLD_MS);
  };

  const cancel = () => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className={cn(
        "rounded-[var(--radius-sm)] p-1.5 text-[var(--color-muted-foreground)] transition-colors",
        "hover:text-[var(--color-destruct)] hover:bg-[var(--color-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
      )}
      title="Hold to delete"
    >
      <span
        className={cn(
          "inline-block transition-transform",
          holding && "scale-90 text-[var(--color-destruct)]",
        )}
      >
        ×
      </span>
    </button>
  );
}

function periodCounts(assignments: Assignment[]): Record<string, number> {
  const out: Record<string, number> = { untagged: 0 };
  for (const a of assignments) {
    if (a.periodId === null) out.untagged = (out.untagged ?? 0) + 1;
    else out[a.periodId] = (out[a.periodId] ?? 0) + 1;
  }
  return out;
}
