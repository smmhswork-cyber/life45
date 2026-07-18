"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

import { useGoogleIdentity } from "@/hooks/use-google-identity";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { cn, initials } from "@/lib/utils";

/**
 * Avatar + dropdown rendered in the sidebar footer. When the user is signed
 * out, it degrades to the GoogleSignInButton so the surface stays useful in
 * either state.
 */
export function UserMenu() {
  const { identity, isHydrated, signOut, pending } = useGoogleIdentity();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isHydrated) {
    // Skeleton placeholder — avoids an empty flash on first hydration.
    return (
      <div className="h-10 rounded-[var(--radius-md)] bg-[var(--color-muted)]/60 animate-pulse" />
    );
  }

  if (!identity) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)]/60 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] mb-2">
          Account
        </p>
        <GoogleSignInButton variant="outline" size="sm" />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)]",
          "bg-[var(--color-card)] px-3 py-2 text-left",
          "transition-colors hover:bg-[var(--color-muted)]/60",
        )}
      >
        {identity.picture ? (
          <Image
            src={identity.picture}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
            unoptimized
          />
        ) : (
          <span className="h-7 w-7 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-[11px] font-semibold grid place-items-center">
            {initials(identity.name)}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate">
            {identity.name}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-foreground)] truncate">
            {identity.email}
          </span>
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={cn(
            "shrink-0 text-[var(--color-muted-foreground)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-30 right-0 left-0 bottom-[calc(100%+6px)]",
            "rounded-[var(--radius-md)] border border-[var(--color-border)]",
            "bg-[var(--color-card)] shadow-[var(--shadow-md)] p-1",
            "animate-in fade-in slide-in-from-bottom-1",
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            disabled={pending}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)]",
              "text-sm text-[var(--color-foreground)]",
              "hover:bg-[var(--color-muted)]",
              "disabled:opacity-60",
            )}
          >
            <LogOut size={14} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
