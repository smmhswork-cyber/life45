"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  Home,
  LineChart,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  Target,
} from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import { MODULES, MODULE_META, type ModuleId } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const PRIMARY: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
];

const MODULE_NAV: NavItem[] = MODULES.map((m: ModuleId) => ({
  href: `/${m}`,
  label: MODULE_META[m].name,
  icon: iconFor(m),
}));

const SECONDARY: NavItem[] = [
  { href: "/settings", label: "Settings", icon: SettingsIcon },
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
    case "assignments":
      return BookOpen;
  }
}

export function NavSidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)]">
          <Sparkles size={18} strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Life45</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Personal OS
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto scrollbar-thin">
        <NavGroup items={PRIMARY} pathname={pathname} />
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Modules
          </p>
          <NavGroup items={MODULE_NAV} pathname={pathname} />
        </div>
        <div>
          <NavGroup items={SECONDARY} pathname={pathname} />
        </div>
      </nav>

      <div className="px-3 pb-4">
        <UserMenu />
      </div>
    </aside>
  );
}

function NavGroup({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium",
                "transition-all duration-150",
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
