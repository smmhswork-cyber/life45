"use client";

import { useId, useState } from "react";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Always-open capture form. Title + priority are required, notes and due
 * date are optional — same shape as the AssignmentForm so it feels right
 * from muscle memory.
 */
export function TaskForm({
  onAdd,
}: {
  onAdd: (input: {
    title: string;
    notes: string;
    priority: Priority;
    dueDate: string | null;
  }) => void;
}) {
  const titleId = useId();
  const notesId = useId();
  const dueId = useId();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      notes: notes.trim(),
      priority,
      dueDate: dueDate || null,
    });
    setTitle("");
    setNotes("");
    // Keep priority + date so adding the next task is one keystroke away.
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
      <div className="space-y-1">
        <label
          htmlFor={titleId}
          className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]"
        >
          Capture a task
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <Input
            id={titleId}
            placeholder="What needs to get done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            maxLength={120}
            className="sm:flex-1"
            aria-label="Task title"
          />
          <Button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            className="self-start"
          >
            <Plus size={14} strokeWidth={2} />
            Add task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label
            htmlFor={notesId}
            className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
          >
            Priority
          </label>
          <PriorityChips value={priority} onChange={setPriority} />
        </div>
        <div>
          <label
            htmlFor={dueId}
            className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
          >
            Due date (optional)
          </label>
          <div className="relative">
            <Calendar
              size={12}
              strokeWidth={1.75}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] pointer-events-none"
            />
            <Input
              id={dueId}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-7"
              aria-label="Due date"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor={notesId}
          className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
        >
          Notes (optional)
        </label>
        <Textarea
          id={notesId}
          placeholder="Sub-tasks, links, or context"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
      </div>
    </div>
  );
}

function PriorityChips({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (next: Priority) => void;
}) {
  const items: { id: Priority; label: string; dotClass: string }[] = [
    { id: "high", label: "High", dotClass: "bg-[var(--color-destruct)]" },
    { id: "medium", label: "Med", dotClass: "bg-[var(--color-primary)]" },
    { id: "low", label: "Low", dotClass: "bg-[var(--color-muted-foreground)]" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Priority"
      className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-0.5"
    >
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="radio"
          aria-checked={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            "transition-colors",
            value === it.id
              ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          )}
        >
          <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", it.dotClass, value !== it.id && "opacity-60")} />
          {it.label}
        </button>
      ))}
    </div>
  );
}
