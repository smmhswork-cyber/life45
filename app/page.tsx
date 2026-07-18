import Link from "next/link";
import { ArrowUpRight, Calendar, Compass } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MODULES, MODULE_META } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import * as Icons from "lucide-react";

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "You do not rise to the level of your goals; you fall to the level of your systems.",
  "The way you do anything is the way you do everything.",
];

export default function HomePage() {
  const today = formatDate(new Date());
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-8 sm:p-12 shadow-[var(--shadow-sm)]">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]" />
        <div className="relative flex flex-col gap-6 max-w-2xl">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/60 px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
            <Calendar size={12} strokeWidth={2} />
            {today}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Move the needle on the
            <br />
            few things that matter.
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-base leading-relaxed max-w-xl">
            Life45 is a calm, local-first workspace for your tasks, habits, goals, journal, and calendar.
            Pick a module to get started.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/tasks">
                Start with tasks
                <ArrowUpRight size={16} strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/journal">
                <Compass size={16} strokeWidth={1.75} />
                Reflect today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Modules</h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Each module has its own workspace and storage key.
            </p>
          </div>
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
            {MODULES.length} ready
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((id) => {
            const meta = MODULE_META[id];
            // Resolve icon by name from lucide-react
            const Icon = (Icons as unknown as Record<string, typeof Icons.Sparkles>)[
              iconNameFor(id)
            ];
            return (
              <Link
                key={id}
                href={`/${id}`}
                className="group block transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-accent-foreground)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-primary-foreground)]">
                        <Icon size={20} strokeWidth={1.75} />
                      </div>
                      <ArrowUpRight
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>
                    <CardTitle className="mt-3">{meta.name}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <code className="text-[10px] font-mono tracking-wide text-[var(--color-muted-foreground)]">
                      {meta.storageKey}
                    </code>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-[var(--color-border)] pt-8">
        <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)] italic max-w-2xl">
          “{quote}”
        </p>
      </section>
    </div>
  );
}

function iconNameFor(id: keyof typeof MODULE_META): string {
  switch (id) {
    case "tasks":
      return "CheckSquare";
    case "habits":
      return "LineChart";
    case "goals":
      return "Target";
    case "journal":
      return "NotebookPen";
    case "calendar":
      return "CalendarDays";
  }
}
