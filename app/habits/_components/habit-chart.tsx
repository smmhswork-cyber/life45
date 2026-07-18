"use client";

import { useId, useMemo } from "react";

import { cn, fromDateKey, lastNDates, shortMonth, toDateKey } from "@/lib/utils";
import { HABIT_VIEW_DAYS, type Habit, type HabitView } from "@/lib/types";

/**
 * Pure SVG line+area chart of *total* daily completions over the visible
 * window. Y axis auto-scales to habits.length (max possible per day) and is
 * rounded up to a tidy ceiling. X axis shows sparse month labels in year view,
 * every weekday letter in week view, and numerical dates in month view.
 */
export function HabitChart({
  habits,
  view,
}: {
  habits: Habit[];
  view: HabitView;
}) {
  const days = HABIT_VIEW_DAYS[view];
  const id = useId();

  // Memo: day → completion count across all habits.
  const { dates, counts, todayKey } = useMemo(() => {
    const ds = lastNDates(days);
    const sets = habits.map((h) => new Set(h.completions));
    const c = ds.map((d) => sets.reduce((sum, s) => sum + (s.has(d) ? 1 : 0), 0));
    return {
      dates: ds,
      counts: c,
      todayKey: toDateKey(new Date()),
    };
  }, [days, habits]);

  const maxPossible = Math.max(habits.length, 1);
  const observedMax = Math.max(1, ...counts);
  const yMax = niceCeiling(Math.max(maxPossible, observedMax));

  const W = 720;
  const H = 200;
  const padX = 32;
  const padTop = 12;
  const padBottom = 30;

  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const xStep = counts.length > 1 ? innerW / (counts.length - 1) : 0;
  const points = counts.map((c, i) => ({
    x: padX + i * xStep,
    y: padTop + innerH - (c / yMax) * innerH,
    value: c,
    date: dates[i]!,
  }));

  const linePath = toSmoothPath(points.map((p) => [p.x, p.y]));
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1]!.x} ${padTop + innerH} L ${points[0]!.x} ${padTop + innerH} Z`
    : "";

  // Y-axis gridlines (tens)
  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(Math.round((yMax * i) / 4));
  }

  // X-axis labels — sparse, view-aware
  const xLabels = sampleXLabels(dates, view);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Completion over time
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            Total check-ins per day across all {habits.length} habit
            {habits.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">
            {sumArray(counts)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Last {days} days
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Habit completion chart over the last ${days} days. Total ${sumArray(counts)} check-ins.`}
        className="w-full h-[200px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines + Y tick labels */}
        {yTicks.map((tick, i) => {
          const y = padTop + innerH - (tick / yMax) * innerH;
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={W - padX}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeOpacity={tick === 0 ? 0.6 : 0.3}
                strokeDasharray={tick === 0 ? undefined : "3 4"}
              />
              <text
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                className="fill-[var(--color-muted-foreground)] tabular-nums"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area */}
        {points.length > 1 && (
          <path d={areaPath} fill={`url(#area-${id})`} />
        )}

        {/* Smoothed line */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={view === "year" ? 1.5 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Today marker (only if today is within the window) */}
        {dates.includes(todayKey) &&
          (() => {
            const idx = dates.indexOf(todayKey);
            const p = points[idx];
            if (!p) return null;
            return (
              <g>
                <line
                  x1={p.x}
                  x2={p.x}
                  y1={padTop}
                  y2={padTop + innerH}
                  stroke="var(--color-primary)"
                  strokeOpacity="0.4"
                  strokeDasharray="2 2"
                />
                <circle cx={p.x} cy={p.y} r={3.5} fill="var(--color-primary)" />
              </g>
            );
          })()}

        {/* Daily dots (suppressed in year view for legibility) */}
        {view !== "year" &&
          points.map((p) => (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r={p.date === todayKey ? 0 : 2}
              fill="var(--color-primary)"
              opacity={p.value === 0 ? 0.25 : 0.85}
            />
          ))}

        {/* X tick labels */}
        {xLabels.map((l) => {
          const idx = dates.indexOf(l.key);
          if (idx < 0) return null;
          const x = padX + idx * xStep;
          return (
            <text
              key={l.key}
              x={x}
              y={H - 10}
              textAnchor="middle"
              fontSize="9"
              className={cn(
                "fill-[var(--color-muted-foreground)]",
                l.today && "fill-[var(--color-primary)] font-semibold",
              )}
            >
              {l.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function niceCeiling(n: number): number {
  if (n <= 4) return 4;
  if (n <= 8) return 8;
  if (n <= 12) return 12;
  if (n <= 20) return 20;
  return Math.ceil(n / 10) * 10;
}

function sumArray(a: number[]): number {
  return a.reduce((s, x) => s + x, 0);
}

/**
 * Cardinally-smoothed Catmull-Rom-to-Bezier path. Falls back to a polyline
 * for arrays with 0–2 points.
 */
function toSmoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]![0]} ${pts[0]![1]}`;
  if (pts.length === 2) {
    return `M ${pts[0]![0]} ${pts[0]![1]} L ${pts[1]![0]} ${pts[1]![1]}`;
  }
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const tension = 0.18;
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function sampleXLabels(
  dates: string[],
  view: HabitView,
): { key: string; label: string; today: boolean }[] {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const out: { key: string; label: string; today: boolean }[] = [];

  if (view === "week") {
    for (const d of dates) {
      const date = fromDateKey(d);
      out.push({
        key: d,
        label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
        today: d === todayKey,
      });
    }
    return out;
  }

  if (view === "month") {
    // Label every 5th day + today
    dates.forEach((d, i) => {
      const date = fromDateKey(d);
      if (i % 5 === 0 || d === todayKey) {
        out.push({ key: d, label: String(date.getDate()), today: d === todayKey });
      }
    });
    return out;
  }

  // year: label every 30 days starting from the end
  for (let i = 0; i < dates.length; i += 30) {
    const d = dates[i]!;
    const date = fromDateKey(d);
    out.push({ key: d, label: shortMonth(date), today: false });
  }
  // Ensure last month appears
  const last = dates[dates.length - 1]!;
  if (!out.find((o) => o.key === last)) {
    out.push({
      key: last,
      label: shortMonth(fromDateKey(last)),
      today: last === todayKey,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Stats card                                                         */
/* ------------------------------------------------------------------ */

export interface HabitStats {
  todayDone: number;
  todayTotal: number;
  streakDays: number;
  totalCheckIns: number;
}

export function computeStats(habits: Habit[]): HabitStats {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  let todayDone = 0;
  let streakDays = 0;
  let totalCheckIns = 0;

  for (const h of habits) {
    if (h.completions.includes(todayKey)) todayDone++;
    totalCheckIns += h.completions.length;
  }

  // Compute "today-aggregate streak": consecutive days where at least one
  // habit was completed.
  const union = new Set<string>();
  for (const h of habits) for (const c of h.completions) union.add(c);
  const cur = new Date(today);
  while (union.has(toKey(cur))) {
    streakDays++;
    cur.setDate(cur.getDate() - 1);
  }

  return {
    todayDone,
    todayTotal: habits.length,
    streakDays,
    totalCheckIns,
  };
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
