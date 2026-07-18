"use client";

import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { todayKey } from "@/lib/utils";
import { MODULE_META, type JournalEntry } from "@/lib/types";
import { safeStorage } from "@/lib/storage";

function makeSampleEntry(): JournalEntry {
  return {
    date: todayKey(),
    title: "First entry",
    body: "A quiet start. The dashboard came together faster than expected.",
    mood: 4,
    updatedAt: new Date().toISOString(),
  };
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);

  useEffect(() => {
    const stored =
      safeStorage.get<Record<string, JournalEntry>>(MODULE_META.journal.storageKey) ?? {};
    const arr = Object.values(stored).sort((a, b) => (a.date < b.date ? 1 : -1));
    setEntries(arr);
  }, []);

  const seed = () => {
    const map: Record<string, JournalEntry> = { [todayKey()]: makeSampleEntry() };
    safeStorage.set(MODULE_META.journal.storageKey, map);
    setEntries([makeSampleEntry()]);
  };

  const hasData = (entries?.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={NotebookPen}
        title="Journal"
        description="A daily reflection. Short enough to keep, long enough to mean something."
      />

      {!hasData ? (
        <>
          <EmptyState
            icon={NotebookPen}
            title="One entry per day, kept close"
            description="Coming features: prompt rotator, mood trend chart, automatic daily backup export, and a “low-light” writing mode."
          />
          <Button onClick={seed}>
            <NotebookPen size={16} strokeWidth={2} />
            Seed today's entry
          </Button>
        </>
      ) : (
        <ul className="space-y-3">
          {entries!.map((e) => (
            <li
              key={e.date}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{e.title ?? "Untitled"}</p>
                <span className="text-xs text-[var(--color-muted-foreground)] font-mono">{e.date}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {e.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-5 bg-[var(--color-muted)]/40">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
          Storage contract
        </p>
        <pre className="mt-2 overflow-x-auto text-xs font-mono text-[var(--color-muted-foreground)] leading-relaxed">
{`Type:      Record<YYYY-MM-DD, JournalEntry>
Key:       ${MODULE_META.journal.storageKey}
Defaults:  {}`}
        </pre>
      </section>
    </div>
  );
}
