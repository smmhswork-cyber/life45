"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Home,
  LineChart,
  NotebookPen,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MODULES, type ModuleId } from "@/lib/types";

const items = [
  { href: "/", label: "Home", icon: Home },
  ...MODULES.map((m) => ({
    href: `/${m}`,
    label: m.charAt(0).toUpperCase() + m.slice(1),
    icon: iconFor(m),
  })),
];

function iconFor(m: ModuleId) {
  switch (m) {
    case "tasks":
      return CheckSquare;
    case "habits":
      return LineChart;
    case "goals":
      return Target;
    case "journal":
      return NotebookPen;
    case "calendar":
      return CalendarDays;
  }
}

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  return (
    <div className="lg:hidden sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
          <Sparkles size={16} />
        </div>
        <span className="text-sm font-semibold tracking-tight">Life45</span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 pb-2 scrollbar-thin">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]",
              )}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
