"use client";

import { LogIn } from "lucide-react";
import { useGoogleIdentity } from "@/hooks/use-google-identity";
import { Button, type ButtonProps } from "@/components/ui/button";

type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

export function GoogleSignInButton({
  variant = "primary",
  size = "md",
}: {
  variant?: Variant;
  size?: Size;
}) {
  const { signIn, configured, pending, error } = useGoogleIdentity();

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={signIn}
        disabled={pending}
        aria-label="Sign in with Google"
      >
        <GoogleG size={14} strokeWidth={1.75} />
        {pending ? "Opening…" : "Sign in with Google"}
        {!configured && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] ml-1">
            dev-only
          </span>
        )}
      </Button>
      {error && (
        <p className="text-[11px] text-[var(--color-destruct)]">{error}</p>
      )}
      {!configured && (
        <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed max-w-xs">
          Set{" "}
          <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--color-muted)]">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </code>{" "}
          and rebuild to enable real sign-in.
        </p>
      )}
    </div>
  );
}

/** Inline single-color "G" so we don't pull the SVG sprite from Google. */
function GoogleG({
  size = 14,
  strokeWidth = 1.75,
}: {
  size?: number;
  strokeWidth?: number;
}) {
  // Use Lucide's LogIn as a fallback visual cue when no clientId is set.
  return <LogIn size={size} strokeWidth={strokeWidth} aria-hidden />;
}
