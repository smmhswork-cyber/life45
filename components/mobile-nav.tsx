"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  Home,
  LineChart,
  NotebookPen,
  Settings as SettingsIcon,
  Target,
} from "lucide-react";
import { MODULES, type ModuleId } from "@/lib/types";

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
    case "assignments":
      return BookOpen;
  }
}

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Life45</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-card)] px-3 py-4 space-y-4">
          <MobileNavLink
            href="/"
            icon={Home}
            label="Dashboard"
            isActive={pathname === "/"}
            onSelect={() => setOpen(false)}
          />
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Modules
            </p>
            <div className="grid grid-cols-2 gap-1">
              {MODULES.map((m) => {
                const href = `/${m}`;
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);
                const Icon = iconFor(m);
                return (
                  <MobileNavLink
                    key={m}
                    href={href}
                    icon={Icon}
                    label={m.charAt(0).toUpperCase() + m.slice(1)}
                    isActive={isActive}
                    onSelect={() => setOpen(false)}
                  />
                );
              })}
            </div>
          </div>
          <MobileNavLink
            href="/settings"
            icon={SettingsIcon}
            label="Settings"
            isActive={pathname.startsWith("/settings")}
            onSelect={() => setOpen(false)}
          />
          <div className="px-1 pt-2 border-t border-[var(--color-border)]">
            <UserMenu />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  onSelect,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium",
        "transition-all duration-150",
        isActive
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
      )}
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
