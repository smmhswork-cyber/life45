"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MODULE_META, type Priority, type Task } from "@/lib/types";
import { cn, fromDateKey, id, toDateKey } from "@/lib/utils";
import { TaskForm } from "./task-form";

type StatusFilter = "all" | "active" | "done";
type SortKey = "smart" | "dueDate" | "priority" | "createdAt" | "title";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Smart default sort: undone first, then high→medium→low priority, then due
 * date (sooner first, no date last), then recently-created last. Mirrors
 * the assignments smart-sort so the user gets a consistent feel.
 */
function sortTasks(list: Task[], sort: SortKey): Task[] {
  const copy = [...list];
  switch (sort) {
    case "dueDate":
      return copy.sort((a, b) =>
        (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99"),
      );
    case "priority":
      return copy.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (pd !== 0) return pd;
        return (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99");
      });
    case "createdAt":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "smart":
    default:
      return copy.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (pd !== 0) return pd;
        const ad = a.dueDate ?? "9999-99-99";
        const bd = b.dueDate ?? "9999-99-99";
        if (ad !== bd) return ad.localeCompare(bd);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

export function TasksWorkspace() {
  const [tasks, setTasks, isHydrated] = useLocalStorage<Task[]>(
    MODULE_META.tasks.storageKey,
    [],
  );

  const [status, setStatus] = useState<StatusFilter>("active");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [sort, setSort] = useState<SortKey>("smart");

  useEffect(() => {
    // Land on "all" if the user has no active tasks, so they aren't staring
    // at an empty state right after signing in.
    if (isHydrated && tasks.length > 0 && status === "active") {
      const anyActive = tasks.some((t) => !t.done);
      if (!anyActive) setStatus("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (status === "active" && t.done) return false;
      if (status === "done" && !t.done) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      return true;
    });
    return sortTasks(filtered, sort);
  }, [tasks, status, priority, sort]);

  const add = (input: { title: string; notes: string; priority: Priority; dueDate: string | null }) => {
    const now = new Date().toISOString();
    const newItem: Task = {
      id: id("task"),
      title: input.title,
      notes: input.notes || undefined,
      done: false,
      priority: input.priority,
      dueDate: input.dueDate || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setTasks([newItem, ...tasks]);
  };

  const toggle = (taskId: string) => {
    const now = new Date().toISOString();
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done, updatedAt: now } : t,
      ),
    );
  };

  const remove = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const updatePriority = (taskId: string, next: Priority) => {
    const now = new Date().toISOString();
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, priority: next, updatedAt: now } : t)));
  };

  const updateDueDate = (taskId: string, dueDate: string | null) => {
    const now = new Date().toISOString();
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, dueDate: dueDate ?? undefined, updatedAt: now } : t,
      ),
    );
  };

  const updateTitle = (taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, title: trimmed, updatedAt: now } : t)),
    );
  };

  if (!isHydrated) {
    return (
      <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/60 animate-pulse" />
    );
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const openCount = tasks.length - doneCount;
  const overdueCount = tasks.filter(
    (t) => !t.done && t.dueDate && t.dueDate < toDateKey(new Date()),
  ).length;

  return (
    <div className="space-y-6">
      {/* Add form */}
      <TaskForm onAdd={add} />

      {/* Filter + sort */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChipRow label="Status">
            {(["active", "all", "done"] as StatusFilter[]).map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
                label={s === "active" ? "Active" : s === "done" ? "Done" : "All"}
              />
            ))}
          </ChipRow>

          <ChipRow label="Priority">
            <Chip
              active={priority === "all"}
              onClick={() => setPriority("all")}
              label="Any"
            />
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <Chip
                key={p}
                active={priority === p}
                onClick={() => setPriority(p)}
                label={p[0]!.toUpperCase() + p.slice(1)}
                accent={p === "high" ? "destruct" : p === "medium" ? "primary" : "muted"}
              />
            ))}
          </ChipRow>

          <div className="flex items-center gap-2">
            <label
              htmlFor="task-sort"
              className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]"
            >
              Sort
            </label>
            <select
              id="task-sort"
              aria-label="Sort tasks"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={cn(
                "h-8 rounded-[var(--radius-md)] border border-[var(--color-input)] bg-[var(--color-card)]",
                "px-2 text-xs text-[var(--color-foreground)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
              )}
            >
              <option value="smart">Smart</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due date</option>
              <option value="createdAt">Recently added</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {tasks.length === 0
                ? "No tasks yet"
                : status === "done"
                  ? "Nothing finished yet"
                  : "All caught up"}
            </CardTitle>
            <CardDescription>
              {tasks.length === 0
                ? "Add your first task above. Title and priority are required — notes and a due date are optional."
                : status === "done"
                  ? "Mark a task complete from the Active tab to see it here."
                  : "Switch the Status filter to All to see completed tasks."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((t) => (
            <TaskRow
              key={t.id}
              t={t}
              onToggle={() => toggle(t.id)}
              onRemove={() => remove(t.id)}
              onUpdatePriority={(p) => updatePriority(t.id, p)}
              onUpdateDueDate={(d) => updateDueDate(t.id, d)}
              onUpdateTitle={(title) => updateTitle(t.id, title)}
            />
          ))}
        </ul>
      )}

      {/* Footer stats */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-[var(--color-muted-foreground)] tabular-nums">
        <span>
          {openCount} open · {doneCount} done
        </span>
        {overdueCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[var(--color-destruct)] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-destruct)]" />
            {overdueCount} overdue
          </span>
        )}
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter chip primitives                                              */
/* ------------------------------------------------------------------ */

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: "destruct" | "primary" | "muted";
}) {
  const dotClass =
    accent === "destruct"
      ? "bg-[var(--color-destruct)]"
      : accent === "primary"
        ? "bg-[var(--color-primary)]"
        : "bg-[var(--color-muted-foreground)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
        active
          ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)]"
          : "bg-[var(--color-card)] text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/30",
      )}
    >
      {accent && (
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      )}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

const HOLD_MS = 350;

function TaskRow({
  t,
  onToggle,
  onRemove,
  onUpdatePriority,
  onUpdateDueDate,
  onUpdateTitle,
}: {
  t: Task;
  onToggle: () => void;
  onRemove: () => void;
  onUpdatePriority: (next: Priority) => void;
  onUpdateDueDate: (next: string | null) => void;
  onUpdateTitle: (next: string) => void;
}) {
  const todayKey = toDateKey(new Date());
  const due = t.dueDate ? fromDateKey(t.dueDate) : null;
  const isOverdue = !!t.dueDate && t.dueDate < todayKey && !t.done;
  const isDueSoon =
    !isOverdue &&
    !!t.dueDate &&
    t.dueDate >= todayKey &&
    !t.done &&
    (fromDateKey(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 2;

  return (
    <li
      className={cn(
        "group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4",
        "transition-colors hover:border-[var(--color-ring)]/40",
        t.done && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={t.done}
          aria-label={t.done ? `Mark ${t.title} as not done` : `Mark ${t.title} as done`}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40",
            t.done
              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-foreground)] grid place-items-center"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
          )}
        >
          {t.done && (
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
          <EditableTitle title={t.title} onSubmit={onUpdateTitle} done={t.done} />
          {t.notes && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2">
              {t.notes}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PrioritySelect value={t.priority} onChange={onUpdatePriority} />
            <DueDatePicker value={t.dueDate ?? null} onChange={onUpdateDueDate} />
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
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-destruct)] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-destruct)]" />
                overdue
              </span>
            )}
          </div>
        </div>

        <DeleteHoldButton onDelete={onRemove} ariaLabel={`Delete ${t.title}`} />
      </div>
    </li>
  );
}

function EditableTitle({
  title,
  onSubmit,
  done,
}: {
  title: string;
  onSubmit: (next: string) => void;
  done: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  if (editing) {
    return (
      <input
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
            setDraft(title);
            setEditing(false);
          }
        }}
        maxLength={120}
        className={cn(
          "w-full text-sm font-medium leading-snug bg-transparent",
          "border-b border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none",
          "px-0 py-0.5",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(title);
        setEditing(true);
      }}
      className={cn(
        "text-left text-sm font-medium leading-snug",
        "hover:text-[var(--color-primary)] transition-colors",
        done && "line-through text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)] hover:line-through",
      )}
    >
      {title}
    </button>
  );
}

function PrioritySelect({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (next: Priority) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Priority"
      className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-0.5"
    >
      {(["high", "medium", "low"] as Priority[]).map((p) => {
        const active = p === value;
        const dotColor =
          p === "high"
            ? "bg-[var(--color-destruct)]"
            : p === "medium"
              ? "bg-[var(--color-primary)]"
              : "bg-[var(--color-muted-foreground)]";
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em]",
              "transition-colors",
              active
                ? "bg-[var(--color-foreground)]/8 text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
            )}
          >
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotColor, !active && "opacity-60")} />
            {p}
          </button>
        );
      })}
    </div>
  );
}

function DueDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
      <span>Due</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-transparent text-[11px] normal-case tracking-normal text-[var(--color-foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40 rounded px-1 py-0.5"
        aria-label="Due date"
      />
    </label>
  );
}

/* Hold-to-delete so an accidental click on the trash doesn't lose work. */
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
    }, HOLD_MS);
  };
  const cancel = () => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

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
