"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";

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
import { MODULE_META, type Habit, MAX_HABITS } from "@/lib/types";
import { cn, colorForId, id, PALETTE, pluralize } from "@/lib/utils";

/**
 * Habits editor — manages the master Habit[] (definitions). The completions
 * array travels with each habit so column-level reads of the grid stay
 * single-source. The 20-habit cap lives here, not on the page.
 */
export function HabitsEditor() {
  const [habits, setHabits, isHydrated] = useLocalStorage<Habit[]>(
    MODULE_META.habits.storageKey,
    [],
  );
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PALETTE[1]!);

  if (!isHydrated) return <HabitsSkeleton />;

  const atCap = habits.length >= MAX_HABITS;

  const add = () => {
    const name = draftName.trim();
    if (!name || atCap) return;
    const newHabit: Habit = {
      id: id("habit"),
      name,
      color: draftColor,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
    setDraftName("");
  };

  const remove = (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId));
  };

  const rename = (habitId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits(habits.map((h) => (h.id === habitId ? { ...h, name: trimmed } : h)));
  };

  const recolor = (habitId: string, color: string) => {
    setHabits(habits.map((h) => (h.id === habitId ? { ...h, color } : h)));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Habits</CardTitle>
            <CardDescription>
              You can track up to {MAX_HABITS} habits. Each lives in the grid on{" "}
              <code className="font-mono text-xs">/habits</code>.
            </CardDescription>
          </div>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border",
              atCap
                ? "border-[var(--color-destruct)] text-[var(--color-destruct)]"
                : "border-[var(--color-border)] text-[var(--color-muted-foreground)]",
            )}
          >
            {habits.length}/{MAX_HABITS}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {habits.length > 0 ? (
          <ul className="space-y-2">
            {habits.map((h) => (
              <HabitRow
                key={h.id}
                habit={h}
                onRename={(name) => rename(h.id, name)}
                onRecolor={(color) => recolor(h.id, color)}
                onRemove={() => remove(h.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)] rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-6 text-center">
            No habits yet. Add your first below.
          </p>
        )}

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              placeholder="Habit name (e.g. Read 20 minutes)"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              maxLength={64}
              className="sm:flex-1"
              aria-label="New habit name"
            />
            <Button onClick={add} disabled={!draftName.trim() || atCap}>
              <Plus size={14} strokeWidth={2} />
              Add habit
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
                aria-label={`Pick color ${c}`}
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

          {atCap && (
            <p className="flex items-center gap-2 text-[11px] text-[var(--color-destruct)]">
              <AlertCircle size={12} strokeWidth={2} />
              Cap reached. Delete one to add another.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                */
/* ------------------------------------------------------------------ */

function HabitRow({
  habit,
  onRename,
  onRecolor,
  onRemove,
}: {
  habit: Habit;
  onRename: (name: string) => void;
  onRecolor: (color: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);

  const color = habit.color || colorForId(habit.id);

  return (
    <li className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <div className="flex items-center gap-3">
        <GripVertical
          size={14}
          strokeWidth={1.75}
          className="text-[var(--color-muted-foreground)] shrink-0"
        />
        <span
          aria-hidden
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              onRename(name);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(name);
                setEditing(false);
              } else if (e.key === "Escape") {
                setName(habit.name);
                setEditing(false);
              }
            }}
            className="flex-1"
            maxLength={64}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 text-left text-sm font-medium truncate hover:underline"
          >
            {habit.name}
          </button>
        )}
        <span className="text-[11px] text-[var(--color-muted-foreground)] tabular-nums shrink-0">
          {pluralize(habit.completions.length, "check-in")}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-destruct)] hover:bg-[var(--color-muted)] transition-colors"
          aria-label={`Delete ${habit.name}`}
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap pl-6">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Set ${habit.name} color to ${c}`}
            aria-pressed={color === c}
            onClick={() => onRecolor(c)}
            className={cn(
              "h-4 w-4 rounded-full border transition-transform",
              color === c
                ? "ring-2 ring-offset-1 ring-offset-[var(--color-card)] ring-[var(--color-ring)] scale-110"
                : "border-[var(--color-border)] hover:scale-105",
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </li>
  );
}

function HabitsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-24 rounded-[var(--radius-md)] bg-[var(--color-muted)]/60 animate-pulse" />
      </CardContent>
    </Card>
  );
}
