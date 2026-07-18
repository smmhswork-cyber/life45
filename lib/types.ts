/**
 * Shared domain types for Life45 modules.
 * Each module owns one root entity and lives under its own storage key.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD or full ISO timestamp

export type Priority = "low" | "medium" | "high";

/** Tasks module */
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

/** Habits module — recurring check-ins, daily cadence */
export interface Habit {
  id: ID;
  name: string;
  description?: string;
  /** ISO date strings on which the habit was completed */
  completions: ISODate[];
  createdAt: string;
}

/** Goals module — long-form objective with milestones */
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
  /** Optional target date */
  targetDate?: ISODate;
  createdAt: string;
  updatedAt: string;
}

/** Journal module — daily entries keyed by date */
export interface JournalEntry {
  /** Date key YYYY-MM-DD — one entry per day */
  date: ISODate;
  title?: string;
  body: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
}

/** Calendar module — events on a date */
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

/** Module identifiers — used for sidebar nav & storage namespacing */
export const MODULES = ["tasks", "habits", "goals", "journal", "calendar"] as const;
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
};
