"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { id, todayKey } from "@/lib/utils";
import { MODULE_META, type CalendarEvent } from "@/lib/types";
import { safeStorage } from "@/lib/storage";

function makeSampleEvent(title: string, category: CalendarEvent["category"], offsetDays: number): CalendarEvent {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return {
    id: id("evt"),
    title,
    date: todayKey(d),
    time: "09:00",
    category,
    createdAt: new Date().toISOString(),
  };
}

const SAMPLES: CalendarEvent[] = [
  makeSampleEvent("Weekly review", "milestone", 0),
  makeSampleEvent("Coffee with Maya", "event", 1),
  makeSampleEvent("Submit invoice", "reminder", 2),
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);

  useEffect(() => {
    setEvents(safeStorage.get<CalendarEvent[]>(MODULE_META.calendar.storageKey) ?? []);
  }, []);

  const seed = () => {
    safeStorage.set(MODULE_META.calendar.storageKey, SAMPLES);
    setEvents(SAMPLES);
  };

  const hasData = (events?.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={CalendarDays}
        title="Calendar"
        description="Events, reminders, and time-boxed commitments on a single scrollable timeline."
      />

      {!hasData ? (
        <>
          <EmptyState
            icon={CalendarDays}
            title="A monthly view, coming up"
            description="Coming features: full month grid, drag-to-reschedule, integration hooks to ICS export, and at-a-glance agenda."
          />
          <Button onClick={seed}>
            <CalendarDays size={16} strokeWidth={2} />
            Seed sample events
          </Button>
        </>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]">
          {events!
            .slice()
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{e.title}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 font-mono">
                    {e.date} {e.time ? `· ${e.time}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    e.category === "event"
                      ? "primary"
                      : e.category === "milestone"
                        ? "success"
                        : "warning"
                  }
                >
                  {e.category}
                </Badge>
              </li>
            ))}
        </ul>
      )}

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-5 bg-[var(--color-muted)]/40">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
          Storage contract
        </p>
        <pre className="mt-2 overflow-x-auto text-xs font-mono text-[var(--color-muted-foreground)] leading-relaxed">
{`Type:      CalendarEvent[]
Key:       ${MODULE_META.calendar.storageKey}
Defaults:  []`}
        </pre>
      </section>
    </div>
  );
}
