"use client";

import { useId, useState } from "react";
import { Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, colorForId } from "@/lib/utils";
import type { ClassPeriod } from "@/lib/types";

/**
 * Always-visible capture form. Folding it into the same card as the list
 * would crowd the viewport — keeping it as a sticky-ish header makes adding
 * the first assignment unambiguous.
 */
export function AssignmentForm({
  periods,
  onAdd,
}: {
  periods: ClassPeriod[];
  onAdd: (input: {
    title: string;
    description: string;
    periodId: string | null;
    dueDate: string | null;
  }) => void;
}) {
  const titleId = useId();
  const descId = useId();
  const periodId = useId();
  const dueId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      description: description.trim(),
      periodId: selectedPeriod === "" ? null : selectedPeriod,
      dueDate: dueDate || null,
    });
    setTitle("");
    setDescription("");
    // Keep period & date selected so adding the next assignment is faster.
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
      <div className="space-y-1">
        <label
          htmlFor={titleId}
          className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]"
        >
          Add assignment
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <Input
            id={titleId}
            placeholder="Title (e.g. Chapter 5 problem set)"
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
            aria-label="Assignment title"
          />
          <Button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            className="self-start"
          >
            <Plus size={14} strokeWidth={2} />
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label
            htmlFor={periodId}
            className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
          >
            Period
          </label>
          <PeriodSelect
            id={periodId}
            periods={periods}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
        <div>
          <label
            htmlFor={dueId}
            className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
          >
            Due date
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
          htmlFor={descId}
          className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-1"
        >
          Notes (optional)
        </label>
        <Textarea
          id={descId}
          placeholder="Details, links, or what to hand in"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Period select — colored chips for defined periods, plus Untagged    */
/* ------------------------------------------------------------------ */

function PeriodSelect({
  id,
  periods,
  value,
  onChange,
}: {
  id: string;
  periods: ClassPeriod[];
  value: string;
  onChange: (next: string) => void;
}) {
  if (periods.length === 0) {
    return (
      <Input
        id={id}
        disabled
        value="Add periods in Settings"
        className="text-[var(--color-muted-foreground)]"
      />
    );
  }
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="radiogroup"
      aria-label="Period"
    >
      <button
        type="button"
        id={`${id}-untagged`}
        role="radio"
        aria-checked={value === ""}
        onClick={() => onChange("")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs",
          value === ""
            ? "bg-[var(--color-foreground)]/5 border-[var(--color-foreground)]/30 text-[var(--color-foreground)]"
            : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
        )}
      >
        Untagged
      </button>
      {periods.map((p) => (
        <button
          key={p.id}
          type="button"
          id={`${id}-${p.id}`}
          role="radio"
          aria-checked={value === p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs",
            value === p.id
              ? "border-transparent text-[var(--color-primary)]"
              : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          )}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: p.color || colorForId(p.id) }}
          />
          {p.name}
        </button>
      ))}
    </div>
  );
}
