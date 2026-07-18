/**
 * Shared domain types for Life45 modules.
 * Each module owns one root entity and lives under its own storage key.
 *
 * Local-first: every primitive is plain JSON-serializable — no Dates, no Maps.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD or full ISO timestamp

export type Priority = "low" | "medium" | "high";

/* ------------------------------------------------------------------ */
/* Tasks                                                              */
/* ------------------------------------------------------------------ */

export interface Task {
  id: ID;
  title: string;
  notes?: string;
  done: boolean;
  priority: Priority;
  dueDate?: ISODate;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Habits                                                             */
/* ------------------------------------------------------------------ */

/**
 * A Habit is a recurring check-in. We join definitions + completion history
 * in one object for the simple, single-source-of-truth model: at 20 habits x
 * 365 days of dates (~73kB in localStorage) we're nowhere near the 5MB quota,
 * and a single read of `habits[]` powers the whole workspace.
 */
export interface Habit {
  id: ID;
  name: string;
  description?: string;
  /** Hex color used for heatmap, chart line, and editor swatch */
  color: string;
  /** Lucide icon name; falls back to Sparkles if unknown */
  icon?: string;
  /** ISO date strings on which the habit was completed */
  completions: ISODate[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Goals                                                              */
/* ------------------------------------------------------------------ */

export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

export interface Goal {
  id: ID;
  title: string;
  description?: string;
  milestones: Milestone[];
  targetDate?: ISODate;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Journal                                                            */
/* ------------------------------------------------------------------ */

export interface JournalEntry {
  /** Date key YYYY-MM-DD — one entry per day */
  date: ISODate;
  title?: string;
  body: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Calendar                                                           */
/* ------------------------------------------------------------------ */

export type CalendarCategory = "event" | "reminder" | "milestone";

export interface CalendarEvent {
  id: ID;
  title: string;
  description?: string;
  date: ISODate;
  time?: string; // HH:MM
  category: CalendarCategory;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Class Periods (settings → Assignments tagging)                      */
/* ------------------------------------------------------------------ */

export interface ClassPeriod {
  id: ID;
  name: string;
  /** Hex color shown as a chip dot */
  color: string;
}

/* ------------------------------------------------------------------ */
/* Assignments                                                        */
/* ------------------------------------------------------------------ */

export interface Assignment {
  id: ID;
  title: string;
  description?: string;
  /** Class period id, or null for "Untagged" */
  periodId: ID | null;
  dueDate?: ISODate;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Identity (Google Sign-In, display-only)                            */
/* ------------------------------------------------------------------ */

export interface UserIdentity {
  /** Google's stable user id */
  sub: string;
  email: string;
  name: string;
  picture?: string;
  signedInAt: string;
}

/* ------------------------------------------------------------------ */
/* Module registry                                                    */
/* ------------------------------------------------------------------ */

export const MODULES = [
  "tasks",
  "habits",
  "goals",
  "journal",
  "calendar",
  "assignments",
] as const;

export type ModuleId = (typeof MODULES)[number];

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  description: string;
  storageKey: string;
}

export const MODULE_META: Record<ModuleId, ModuleMeta> = {
  tasks: {
    id: "tasks",
    name: "Tasks",
    description: "Capture, prioritize, and complete what matters.",
    storageKey: "life45:tasks:v1",
  },
  habits: {
    id: "habits",
    name: "Habits",
    description: "Build the small things that compound over time.",
    storageKey: "life45:habits:v1",
  },
  goals: {
    id: "goals",
    name: "Goals",
    description: "Long-form objectives broken into milestones.",
    storageKey: "life45:goals:v1",
  },
  journal: {
    id: "journal",
    name: "Journal",
    description: "A daily reflection, kept close.",
    storageKey: "life45:journal:v1",
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    description: "Events, reminders, and time-boxed commitments.",
    storageKey: "life45:calendar:v1",
  },
  assignments: {
    id: "assignments",
    name: "Assignments",
    description: "Schoolwork or tasks, tagged by class period.",
    storageKey: "life45:assignments:v1",
  },
};

/* ------------------------------------------------------------------ */
/* Non-module storage keys (settings, identity)                       */
/* ------------------------------------------------------------------ */

export const STORAGE_KEYS = {
  classPeriods: "life45:class-periods:v1",
  identity: "life45:identity:v1",
  /** Cross-cutting user prefs (theme, etc. — reserved for future use) */
  preferences: "life45:preferences:v1",
} as const;

/* ------------------------------------------------------------------ */
/* Habit-view scope (used by grid + chart)                            */
/* ------------------------------------------------------------------ */

export type HabitView = "week" | "month" | "year";

export const HABIT_VIEW_DAYS: Record<HabitView, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export const HABIT_VIEW_LABELS: Record<HabitView, string> = {
  week: "Week",
  month: "Month",
  year: "Year",
};

export const MAX_HABITS = 20;
